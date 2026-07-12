import { Router, Request, Response } from "express";
import { resources } from "../data/seed";
import { Booking, Resource } from "../types";
import { addLog } from "./activity";

const router = Router();

export const bookings: Booking[] = [];

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

// POST add resource
router.post("/resources", (req: Request, res: Response) => {
  const { name, type, capacity, location } = req.body;
  if (!name || !type) return res.status(400).json({ success: false, error: "name and type are required" });
  const resource: Resource = {
    id: `RES-${String(resources.length + 1).padStart(3, "0")}`,
    name,
    type,
    capacity: Number(capacity) || 1,
    location: location || "—",
    status: "Available",
  };
  resources.push(resource);
  res.status(201).json({ success: true, data: resource, message: "Resource added" });
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
  const conflict = bookings.find(
    b =>
      b.resourceId === resourceId &&
      b.status !== "Cancelled" &&
      new Date(startTime) < new Date(b.endTime) &&
      new Date(endTime) > new Date(b.startTime)
  );
  if (conflict)
    return res
      .status(409)
      .json({ success: false, error: `Slot conflicts with booking ${conflict.id} (${conflict.purpose})` });

  const booking: Booking = {
    id: `BOK-${String(bookings.length + 1).padStart(3, "0")}`,
    resourceId,
    resourceName: resource.name,
    bookedBy,
    department: department || "—",
    purpose: purpose || "—",
    startTime,
    endTime,
    attendees: Number(attendees) || 1,
    status: "Confirmed",
    notes: notes || "",
  };
  bookings.push(booking);
  addLog("Booking Confirmed", `${resource.name} booked by ${bookedBy} for ${purpose || "—"}`, bookedBy, "Booking", "info");
  res.status(201).json({ success: true, data: booking, message: "Booking confirmed" });
});

// PATCH cancel booking
router.patch("/:id/cancel", (req: Request, res: Response) => {
  const idx = bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Booking not found" });
  bookings[idx].status = "Cancelled";
  addLog("Booking Cancelled", `${bookings[idx].resourceName} booking cancelled`, "System", "Booking", "warning");
  res.json({ success: true, data: bookings[idx], message: "Booking cancelled" });
});

export default router;
