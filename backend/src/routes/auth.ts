import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../lib/prisma";
import { sendPasswordResetEmail } from "../lib/mailer";

const router = Router();

function makeInitials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("");
}

function signToken(user: { id: string; email: string; role: string; organization: string }) {
  const secret    = process.env.JWT_SECRET || "assetflow_dev_secret";
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as string;
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, organization: user.organization },
    secret,
    { expiresIn } as jwt.SignOptions
  );
}

function publicUser(u: { id: string; name: string; email: string; role: string; organization: string }) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase(),
    organization: u.organization,
    initials: makeInitials(u.name),
  };
}

// ── POST /api/auth/signup ──────────────────────────────
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, organization } = req.body;

  if (!name || !email || !password || !organization)
    return res.status(400).json({ success: false, error: "All fields are required." });
  if (password.length < 8)
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (exists)
    return res.status(409).json({ success: false, error: "An account with this email already exists." });

  // First user ever becomes ADMIN, everyone else is EMPLOYEE
  const count        = await prisma.user.count();
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

// ── POST /api/auth/login ───────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, error: "Email and password are required." });

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user)
    return res.status(401).json({ success: false, error: "Invalid email or password." });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid)
    return res.status(401).json({ success: false, error: "Invalid email or password." });

  const token = signToken(user);
  res.json({ success: true, token, user: publicUser(user), message: "Login successful." });
});

// ── GET /api/auth/me ───────────────────────────────────
router.get("/me", async (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer "))
    return res.status(401).json({ success: false, error: "No token provided." });

  try {
    const decoded = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET || "assetflow_dev_secret"
    ) as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    res.json({ success: true, user: publicUser(user) });
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
});

// ── POST /api/auth/forgot-password ────────────────────
router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, error: "Email is required." });

  // Always return success — prevents email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (user) {
    const token  = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/reset-password?token=${token}`;

    try {
      await sendPasswordResetEmail(user.email, user.name, resetUrl);
      console.log(`[Password Reset] Email sent to ${user.email}`);
    } catch (mailErr) {
      // Log but don't expose — email failure shouldn't leak user existence
      console.error("[Password Reset] Email failed:", mailErr);
      console.log(`[Password Reset] Reset URL (dev fallback): ${resetUrl}`);
    }
  }

  res.json({ success: true, message: "If that email is registered, a reset link has been sent." });
});

// ── POST /api/auth/reset-password ─────────────────────
router.post("/reset-password", async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password)
    return res.status(400).json({ success: false, error: "Token and new password are required." });
  if (password.length < 8)
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gte: new Date() },
    },
  });

  if (!user)
    return res.status(400).json({ success: false, error: "This reset link is invalid or has expired." });

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  res.json({ success: true, message: "Password reset successfully. Please log in with your new password." });
});

export default router;
