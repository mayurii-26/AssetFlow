import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET resources
router.get("/resources", async (_req, res: Response) => {
  const data = await prisma.resource.findMany({ orderBy: { name: "asc" } });
  res.json({ success: true, data, total: data.length });
});

// GET bookings
router.get("/", async (req: Request, res: Response) => {
  const { resourceId } = req.query;
  const data = await prisma.booking.findMany({
    where: resourceId ? { resourceId: String(resourceId) } : undefined,
    include: { resource: true },
    orderBy: { startTime: "asc" },
  });
  res.json({ success: true, data, total: data.length });
});

// POST new booking — with conflict detection
router.post("/", async (req: Request, res: Response) => {
  const { resourceId, bookedById, department, purpose, startTime, endTime, attendees, notes } = req.body;
  if (!resourceId || !bookedById || !startTime || !endTime)
    return res.status(400).json({ success: false, error: "resourceId, bookedById, startTime, endTime are required" });

  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) return res.status(404).json({ success: false, error: "Resource not found" });

  // Conflict check
  const conflict = await prisma.booking.findFirst({
    where: {
      resourceId,
      status: { not: "CANCELLED" },
      startTime: { lt: new Date(endTime) },
      endTime:   { gt: new Date(startTime) },
    },
  });
  if (conflict)
    return res.status(409).json({ success: false, error: `Slot conflicts with booking for "${conflict.purpose}"` });

  const booking = await prisma.booking.create({
    data: {
      resourceId,
      bookedById,
      department: department || "—",
      purpose: purpose || "—",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendees: Number(attendees) || 1,
      notes: notes || "",
    },
    include: { resource: true },
  });
  res.status(201).json({ success: true, data: booking, message: "Booking confirmed" });
});

// PATCH cancel
router.patch("/:id/cancel", async (req: Request, res: Response) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  }).catch(() => null);
  if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
  res.json({ success: true, data: booking, message: "Booking cancelled" });
});

export default router;
