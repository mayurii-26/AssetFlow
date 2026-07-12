import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET notifications for a user
router.get("/", async (req: Request, res: Response) => {
  const { userId, type, read } = req.query;
  if (!userId) return res.status(400).json({ success: false, error: "userId is required" });

  const where: Record<string, unknown> = { userId: String(userId) };
  if (type) where.type = String(type).toUpperCase();
  if (read !== undefined) where.read = read === "true";

  const data = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data, total: data.length, unread: data.filter((n: { read: boolean }) => !n.read).length });
});

// PATCH mark single read
router.patch("/:id/read", async (req: Request, res: Response) => {
  const n = await prisma.notification.update({ where: { id: req.params.id }, data: { read: true } }).catch(() => null);
  if (!n) return res.status(404).json({ success: false, error: "Notification not found" });
  res.json({ success: true, data: n });
});

// PATCH mark all read for user
router.patch("/mark-all-read", async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, error: "userId is required" });
  await prisma.notification.updateMany({ where: { userId }, data: { read: true } });
  res.json({ success: true, message: "All notifications marked as read" });
});

// DELETE
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.notification.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ success: true, message: "Notification deleted" });
});

export default router;
