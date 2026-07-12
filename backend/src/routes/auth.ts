import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = Router();

function makeInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

function signToken(user: { id: string; email: string; role: string; organization: string }) {
  const secret = process.env.JWT_SECRET || "assetflow_dev_secret";
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, organization: user.organization },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as string } as jwt.SignOptions
  );
}

function publicUser(u: { id: string; name: string; email: string; role: string; organization: string }) {
  return { id: u.id, name: u.name, email: u.email, role: u.role.toLowerCase(), organization: u.organization, initials: makeInitials(u.name) };
}

// POST /api/auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, organization } = req.body;
  if (!name || !email || !password || !organization)
    return res.status(400).json({ success: false, error: "All fields are required." });
  if (password.length < 8)
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (exists) return res.status(409).json({ success: false, error: "An account with this email already exists." });

  const count = await prisma.user.count();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: count === 0 ? "ADMIN" : "EMPLOYEE",
      organization: organization.trim(),
    },
  });

  const token = signToken(user);
  res.status(201).json({ success: true, token, user: publicUser(user), message: "Account created." });
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, error: "Email and password are required." });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return res.status(401).json({ success: false, error: "Invalid email or password." });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ success: false, error: "Invalid email or password." });

  const token = signToken(user);
  res.json({ success: true, token, user: publicUser(user), message: "Login successful." });
});

// GET /api/auth/me
router.get("/me", async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, error: "No token provided." });
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET || "assetflow_dev_secret") as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    res.json({ success: true, user: publicUser(user) });
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
});

export default router;
