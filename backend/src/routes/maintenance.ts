import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET all tasks
router.get("/", async (req: Request, res: Response) => {
  const { status } = req.query;
  const data = await prisma.maintenanceTask.findMany({
    where: status ? { status: String(status).toUpperCase().replace(/ /g, "_") as "PENDING" | "APPROVED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS" | "RESOLVED" } : undefined,
    include: { asset: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data, total: data.length });
});

// GET single task
router.get("/:id", async (req: Request, res: Response) => {
  const task = await prisma.maintenanceTask.findUnique({
    where: { id: req.params.id },
    include: { asset: true },
  });
  if (!task) return res.status(404).json({ success: false, error: "Task not found" });
  res.json({ success: true, data: task });
});

// POST create task
router.post("/", async (req: Request, res: Response) => {
  const { assetId, issue, priority, department, description, technician, raisedById } = req.body;
  if (!assetId || !issue || !raisedById)
    return res.status(400).json({ success: false, error: "assetId, issue, and raisedById are required" });

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });

  const [task] = await prisma.$transaction([
    prisma.maintenanceTask.create({
      data: {
        assetId, raisedById,
        issue, description: description || "",
        priority: priority?.toUpperCase() || "MEDIUM",
        technician: technician || null,
        department: department || asset.departmentId,
      },
    }),
    prisma.asset.update({ where: { id: assetId }, data: { status: "UNDER_MAINTENANCE" } }),
  ]);
  res.status(201).json({ success: true, data: task, message: "Maintenance request raised" });
});

// PATCH update status / move kanban column
router.patch("/:id", async (req: Request, res: Response) => {
  const { status, technician } = req.body;

  const existing = await prisma.maintenanceTask.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ success: false, error: "Task not found" });

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = String(status).toUpperCase().replace(/ /g, "_");
  if (technician !== undefined) updateData.technician = technician;
  if (status?.toUpperCase() === "RESOLVED") updateData.resolvedAt = new Date();

  const task = await prisma.maintenanceTask.update({ where: { id: req.params.id }, data: updateData });

  // Auto-restore asset to Available when Resolved
  if (status?.toUpperCase() === "RESOLVED") {
    await prisma.asset.update({ where: { id: existing.assetId }, data: { status: "AVAILABLE" } });
  }

  res.json({ success: true, data: task, message: "Maintenance task updated" });
});

// DELETE task
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.maintenanceTask.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ success: true, message: "Task deleted" });
});

export default router;
