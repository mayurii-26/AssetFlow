import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET all allocations
router.get("/", async (_req, res: Response) => {
  const data = await prisma.allocation.findMany({
    include: { asset: true },
    orderBy: { allocatedAt: "desc" },
  });
  res.json({ success: true, data, total: data.length });
});

// POST allocate asset
router.post("/", async (req: Request, res: Response) => {
  const { assetId, toEmployee, department, reason, notes, allocatedById } = req.body;
  if (!assetId || !toEmployee || !allocatedById)
    return res.status(400).json({ success: false, error: "assetId, toEmployee, and allocatedById are required" });

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });
  if (asset.status === "ALLOCATED")
    return res.status(409).json({ success: false, error: `Already allocated to ${asset.currentHolder}. Raise a transfer request.` });

  const [alloc] = await prisma.$transaction([
    prisma.allocation.create({
      data: { assetId, allocatedById, toEmployee, department: department || asset.departmentId, reason: reason || "", notes: notes || "" },
    }),
    prisma.asset.update({
      where: { id: assetId },
      data: { status: "ALLOCATED", currentHolder: toEmployee },
    }),
  ]);
  res.status(201).json({ success: true, data: alloc, message: "Asset allocated successfully" });
});

// GET transfer requests
router.get("/transfers", async (req: Request, res: Response) => {
  const { status } = req.query;
  const data = await prisma.transferRequest.findMany({
    where: status ? { status: String(status).toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    include: { asset: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data, total: data.length });
});

// POST transfer request
router.post("/transfers", async (req: Request, res: Response) => {
  const { assetId, toEmployee, reason, priority, notes, requestedById } = req.body;
  if (!assetId || !toEmployee || !requestedById)
    return res.status(400).json({ success: false, error: "assetId, toEmployee, and requestedById are required" });

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });

  const tr = await prisma.transferRequest.create({
    data: {
      assetId,
      requestedById,
      fromEmployee: asset.currentHolder,
      toEmployee,
      department: asset.departmentId,
      reason: reason || "—",
      notes: notes || "",
      priority: priority?.toUpperCase() || "MEDIUM",
    },
    include: { asset: true },
  });
  res.status(201).json({ success: true, data: tr, message: "Transfer request submitted" });
});

// PATCH approve/reject transfer
router.patch("/transfers/:id", async (req: Request, res: Response) => {
  const { status, approvedById } = req.body;
  if (!["APPROVED", "REJECTED"].includes(status?.toUpperCase()))
    return res.status(400).json({ success: false, error: "status must be APPROVED or REJECTED" });

  const tr = await prisma.transferRequest.findUnique({ where: { id: req.params.id } });
  if (!tr) return res.status(404).json({ success: false, error: "Transfer request not found" });

  const updated = await prisma.transferRequest.update({
    where: { id: req.params.id },
    data: { status: status.toUpperCase(), approvedById: approvedById || null },
  });

  if (status.toUpperCase() === "APPROVED") {
    await prisma.asset.update({
      where: { id: tr.assetId },
      data: { currentHolder: tr.toEmployee },
    });
  }
  res.json({ success: true, data: updated, message: `Transfer ${status.toLowerCase()}` });
});

export default router;
