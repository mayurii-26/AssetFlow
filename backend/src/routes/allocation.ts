import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// ─────────────────────────────────────────────
// ACTIVE ALLOCATIONS
// ─────────────────────────────────────────────

// GET all active allocations
router.get("/", async (_req, res: Response) => {
  const data = await prisma.allocation.findMany({
    include: { asset: true },
    orderBy: { allocatedAt: "desc" },
  });
  res.json({ success: true, data, total: data.length });
});

// POST allocate asset — admin-only direct allocation (bypass request flow)
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

// ─────────────────────────────────────────────
// ALLOCATION REQUESTS (employee → admin approval)
// ─────────────────────────────────────────────

// GET allocation requests — optionally filter by status or requestedById
router.get("/requests", async (req: Request, res: Response) => {
  const { status, requestedById } = req.query;
  const where: Record<string, unknown> = {};
  if (status) where.status = String(status).toUpperCase();
  if (requestedById) where.requestedById = String(requestedById);

  const data = await prisma.allocationRequest.findMany({
    where,
    include: { asset: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data, total: data.length });
});

// POST allocation request — employee requests an asset
router.post("/requests", async (req: Request, res: Response) => {
  const { assetId, requestedById, toEmployee, department, reason, notes, priority } = req.body;
  if (!assetId || !requestedById || !toEmployee)
    return res.status(400).json({ success: false, error: "assetId, requestedById, and toEmployee are required" });

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });
  if (asset.status === "ALLOCATED")
    return res.status(409).json({ success: false, error: `Asset is already allocated to ${asset.currentHolder}.` });

  // Prevent duplicate pending requests for the same asset
  const existing = await prisma.allocationRequest.findFirst({
    where: { assetId, status: "PENDING" },
  });
  if (existing)
    return res.status(409).json({ success: false, error: "A pending request already exists for this asset." });

  const allocationReq = await prisma.allocationRequest.create({
    data: {
      assetId,
      requestedById,
      toEmployee,
      department: department || asset.departmentId,
      reason: reason || "",
      notes: notes || "",
      priority: priority?.toUpperCase() || "MEDIUM",
    },
    include: { asset: true },
  });
  res.status(201).json({ success: true, data: allocationReq, message: "Allocation request submitted. Awaiting admin approval." });
});

// PATCH approve allocation request — admin approves and asset gets allocated
router.patch("/requests/:id/approve", async (req: Request, res: Response) => {
  const { approvedById } = req.body;

  const allocationReq = await prisma.allocationRequest.findUnique({ where: { id: req.params.id } });
  if (!allocationReq) return res.status(404).json({ success: false, error: "Allocation request not found" });
  if (allocationReq.status !== "PENDING")
    return res.status(400).json({ success: false, error: `Request is already ${allocationReq.status.toLowerCase()}` });

  const asset = await prisma.asset.findUnique({ where: { id: allocationReq.assetId } });
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });
  if (asset.status === "ALLOCATED")
    return res.status(409).json({ success: false, error: `Asset is now allocated to ${asset.currentHolder}. Cannot approve.` });

  // Approve request + create actual allocation + update asset status in one transaction
  const [updatedReq] = await prisma.$transaction([
    prisma.allocationRequest.update({
      where: { id: req.params.id },
      data: { status: "APPROVED", approvedById: approvedById || null },
      include: { asset: true },
    }),
    prisma.allocation.create({
      data: {
        assetId: allocationReq.assetId,
        allocatedById: approvedById || allocationReq.requestedById,
        toEmployee: allocationReq.toEmployee,
        department: allocationReq.department || asset.departmentId,
        reason: allocationReq.reason || "",
        notes: allocationReq.notes || "",
      },
    }),
    prisma.asset.update({
      where: { id: allocationReq.assetId },
      data: { status: "ALLOCATED", currentHolder: allocationReq.toEmployee },
    }),
  ]);

  res.json({ success: true, data: updatedReq, message: "Allocation request approved. Asset allocated." });
});

// PATCH reject allocation request — admin rejects
router.patch("/requests/:id/reject", async (req: Request, res: Response) => {
  const { approvedById } = req.body;

  const allocationReq = await prisma.allocationRequest.findUnique({ where: { id: req.params.id } });
  if (!allocationReq) return res.status(404).json({ success: false, error: "Allocation request not found" });
  if (allocationReq.status !== "PENDING")
    return res.status(400).json({ success: false, error: `Request is already ${allocationReq.status.toLowerCase()}` });

  const updated = await prisma.allocationRequest.update({
    where: { id: req.params.id },
    data: { status: "REJECTED", approvedById: approvedById || null },
    include: { asset: true },
  });
  res.json({ success: true, data: updated, message: "Allocation request rejected." });
});

// ─────────────────────────────────────────────
// TRANSFER REQUESTS
// ─────────────────────────────────────────────

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
