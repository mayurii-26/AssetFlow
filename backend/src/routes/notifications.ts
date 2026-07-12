import { Router, Request, Response } from "express";
import { Notification } from "../types";

const router = Router();

export const notifications: Notification[] = [];

let counter = 1;

export function createNotification(
  type: Notification["type"],
  title: string,
  description: string,
  priority: Notification["priority"],
  module: string
): void {
  notifications.unshift({
    id: `NOT-${String(counter++).padStart(3, "0")}`,
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
    priority,
    read: false,
    module,
  });
  // Keep last 200
  if (notifications.length > 200) notifications.pop();
}

// GET notifications — optional type/read filters
router.get("/", (req: Request, res: Response) => {
  const { type, read } = req.query;
  let result = [...notifications];
  if (type) result = result.filter(n => n.type === type);
  if (read !== undefined) result = result.filter(n => n.read === (read === "true"));
  res.json({
    success: true,
    data: result,
    total: result.length,
    unread: notifications.filter(n => !n.read).length,
  });
});

// PATCH mark single notification read — must come before /:id
router.patch("/mark-all-read", (_req: Request, res: Response) => {
  notifications.forEach(n => (n.read = true));
  res.json({ success: true, message: "All notifications marked as read" });
});

router.patch("/:id/read", (req: Request, res: Response) => {
  const n = notifications.find(n => n.id === req.params.id);
  if (!n) return res.status(404).json({ success: false, error: "Notification not found" });
  n.read = true;
  res.json({ success: true, data: n });
});

// DELETE a notification
router.delete("/:id", (req: Request, res: Response) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Notification not found" });
  notifications.splice(idx, 1);
  res.json({ success: true, message: "Notification deleted" });
});

export default router;
