import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

const router = Router();

function getUserIdFromToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const decoded = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET || "assetflow_dev_secret"
    ) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// GET /api/notifications — userId from JWT token
router.get("/", async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req) || (req.query.userId as string);
  if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });

  const { type, read } = req.query;
  const where: Record<string, unknown> = { userId };
  if (type) where.type = String(type).toUpperCase();
  if (read !== undefined) where.read = read === "true";

  const data = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  res.json({ success: true, data, total: data.length, unread: data.filter(n => !n.read).length });
});

// PATCH mark single read
router.patch("/:id/read", async (req: Request, res: Response) => {
  const n = await prisma.notification
    .update({ where: { id: req.params.id }, data: { read: true } })
    .catch(() => null);
  if (!n) return res.status(404).json({ success: false, error: "Notification not found" });
  res.json({ success: true, data: n });
});

// PATCH mark all read — userId from JWT
router.patch("/mark-all-read", async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req) || req.body.userId;
  if (!userId) return res.status(401).json({ success: false, error: "Authentication required." });
  await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
  res.json({ success: true, message: "All notifications marked as read" });
});

// DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.notification.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ success: true, message: "Notification deleted" });
});

export default router;
