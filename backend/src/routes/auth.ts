import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "employee";
  organization: string;
  createdAt: string;
}

// In-memory user store — swap for a DB in production
const users: StoredUser[] = [];

// Seed two demo accounts on startup
(async () => {
  const adminHash = await bcrypt.hash("password123", 10);
  const userHash  = await bcrypt.hash("password123", 10);
  users.push(
    {
      id: "USR-001",
      name: "Aditya Kumar",
      email: "admin@assetflow.com",
      passwordHash: adminHash,
      role: "admin",
      organization: "Nexus Corp",
      createdAt: new Date().toISOString(),
    },
    {
      id: "USR-002",
      name: "Priya Sharma",
      email: "user@assetflow.com",
      passwordHash: userHash,
      role: "employee",
      organization: "Nexus Corp",
      createdAt: new Date().toISOString(),
    }
  );
})();

function makeInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function signToken(user: StoredUser): string {
  const secret = process.env.JWT_SECRET || "assetflow_dev_secret";
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as string;
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, organization: user.organization },
    secret,
    { expiresIn } as jwt.SignOptions
  );
}

function publicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organization: user.organization,
    initials: makeInitials(user.name),
  };
}

// ── POST /api/auth/signup ──────────────────────────────
router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, organization } = req.body;

  if (!name || !email || !password || !organization) {
    return res.status(400).json({ success: false, error: "All fields are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ success: false, error: "Password must be at least 8 characters." });
  }

  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ success: false, error: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: StoredUser = {
    id: `USR-${String(users.length + 1).padStart(3, "0")}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    role: users.length === 0 ? "admin" : "employee", // first user becomes admin
    organization: organization.trim(),
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);

  const token = signToken(newUser);
  res.status(201).json({
    success: true,
    token,
    user: publicUser(newUser),
    message: "Account created successfully.",
  });
});

// ── POST /api/auth/login ───────────────────────────────
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, error: "Invalid email or password." });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ success: false, error: "Invalid email or password." });
  }

  const token = signToken(user);
  res.json({
    success: true,
    token,
    user: publicUser(user),
    message: "Login successful.",
  });
});

// ── GET /api/auth/me — verify token & return profile ──
router.get("/me", (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "No token provided." });
  }

  const token = authHeader.slice(7);
  try {
    const secret = process.env.JWT_SECRET || "assetflow_dev_secret";
    const decoded = jwt.verify(token, secret) as { id: string };
    const user = users.find((u) => u.id === decoded.id);
    if (!user) return res.status(404).json({ success: false, error: "User not found." });
    res.json({ success: true, user: publicUser(user) });
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
});

export default router;
