import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET resources
router.get("/resources", async (_req, res: Response) => {
  const data = await prisma.resource.findMany({ orderBy: { name: "asc" } });
  res.json({ success: true, data, total: data.length });
});

// GET bookings — optionally filter by resourceId or bookedById
router.get("/", async (req: Request, res: Response) => {
  const { resourceId, bookedById } = req.query;
  const where: Record<string, unknown> = {};
  if (resourceId) where.resourceId = String(resourceId);
  if (bookedById) where.bookedById = String(bookedById);

  const data = await prisma.booking.findMany({
    where,
    include: { resource: true },
    orderBy: { startTime: "asc" },
  });
  res.json({ success: true, data, total: data.length });
});

// POST new booking — always creates as PENDING (requires admin approval)
router.post("/", async (req: Request, res: Response) => {
  const { resourceId, bookedById, department, purpose, startTime, endTime, attendees, notes } = req.body;
  if (!resourceId || !bookedById || !startTime || !endTime)
    return res.status(400).json({ success: false, error: "resourceId, bookedById, startTime, endTime are required" });

  const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
  if (!resource) return res.status(404).json({ success: false, error: "Resource not found" });

  // Conflict check against CONFIRMED bookings only
  const conflict = await prisma.booking.findFirst({
    where: {
      resourceId,
      status: "CONFIRMED",
      startTime: { lt: new Date(endTime) },
      endTime:   { gt: new Date(startTime) },
    },
  });
  if (conflict)
    return res.status(409).json({ success: false, error: `Slot conflicts with an approved booking for "${conflict.purpose}"` });

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
      status: "PENDING",   // ← always PENDING until admin approves
    },
    include: { resource: true },
  });
  res.status(201).json({ success: true, data: booking, message: "Booking request submitted. Awaiting admin approval." });
});

// PATCH approve — admin approves a pending booking
router.patch("/:id/approve", async (req: Request, res: Response) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
  if (booking.status !== "PENDING")
    return res.status(400).json({ success: false, error: `Booking is already ${booking.status.toLowerCase()}` });

  // Check for conflicts with other CONFIRMED bookings before approving
  const conflict = await prisma.booking.findFirst({
    where: {
      resourceId: booking.resourceId,
      status: "CONFIRMED",
      id: { not: booking.id },
      startTime: { lt: booking.endTime },
      endTime:   { gt: booking.startTime },
    },
  });
  if (conflict)
    return res.status(409).json({ success: false, error: `Cannot approve: conflicts with an existing booking for "${conflict.purpose}"` });

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: "CONFIRMED" },
    include: { resource: true },
  });
  res.json({ success: true, data: updated, message: "Booking approved" });
});

// PATCH reject — admin rejects a pending booking
router.patch("/:id/reject", async (req: Request, res: Response) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
  if (booking.status !== "PENDING")
    return res.status(400).json({ success: false, error: `Booking is already ${booking.status.toLowerCase()}` });

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
    include: { resource: true },
  });
  res.json({ success: true, data: updated, message: "Booking rejected" });
});

// PATCH cancel — employee cancels their own pending or confirmed booking
router.patch("/:id/cancel", async (req: Request, res: Response) => {
  const booking = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  }).catch(() => null);
  if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });
  res.json({ success: true, data: booking, message: "Booking cancelled" });
});

export default router;
