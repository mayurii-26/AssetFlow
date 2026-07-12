import { Router, Request, Response } from "express";
import { resources } from "../data/seed";
import { Booking } from "../types";

const router = Router();

const bookings: Booking[] = [
  { id: "BOK-001", resourceId: "RES-001", resourceName: "Conference Room A", bookedBy: "Arjun Mehta", department: "Engineering", purpose: "Sprint Planning", startTime: "2024-07-15T09:00:00Z", endTime: "2024-07-15T11:00:00Z", attendees: 8, status: "Confirmed", notes: "" },
  { id: "BOK-002", resourceId: "RES-002", resourceName: "Projector Unit 1", bookedBy: "Priya Sharma", department: "Sales", purpose: "Client Presentation", startTime: "2024-07-15T14:00:00Z", endTime: "2024-07-15T15:30:00Z", attendees: 5, status: "Confirmed", notes: "" },
];

// GET all bookings
router.get("/", (req: Request, res: Response) => {
  const { resourceId } = req.query;
  const result = resourceId ? bookings.filter(b => b.resourceId === resourceId) : bookings;
  res.json({ success: true, data: result, total: result.length });
});

// GET resources
router.get("/resources", (_req: Request, res: Response) => {
  res.json({ success: true, data: resources, total: resources.length });
});

// POST new booking — conflict check
router.post("/", (req: Request, res: Response) => {
  const { resourceId, bookedBy, department, purpose, startTime, endTime, attendees, notes } = req.body;
  if (!resourceId || !startTime || !endTime || !bookedBy) {
    return res.status(400).json({ success: false, error: "resourceId, bookedBy, startTime, endTime are required" });
  }
  const resource = resources.find(r => r.id === resourceId);
  if (!resource) return res.status(404).json({ success: false, error: "Resource not found" });

  // Conflict check
  const conflict = bookings.find(b =>
    b.resourceId === resourceId &&
    b.status !== "Cancelled" &&
    new Date(startTime) < new Date(b.endTime) &&
    new Date(endTime) > new Date(b.startTime)
  );
  if (conflict) return res.status(409).json({ success: false, error: `Slot conflicts with booking ${conflict.id} (${conflict.purpose})` });

  const booking: Booking = {
    id: `BOK-${String(bookings.length + 1).padStart(3, "0")}`,
    resourceId, resourceName: resource.name,
    bookedBy, department: department || "—",
    purpose: purpose || "—",
    startTime, endTime,
    attendees: Number(attendees) || 1,
    status: "Confirmed",
    notes: notes || "",
  };
  bookings.push(booking);
  res.status(201).json({ success: true, data: booking, message: "Booking confirmed" });
});

// PATCH cancel booking
router.patch("/:id/cancel", (req: Request, res: Response) => {
  const idx = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Booking not found" });
  bookings[idx].status = "Cancelled";
  res.json({ success: true, data: bookings[idx], message: "Booking cancelled" });
});

export default router;
