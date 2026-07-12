import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET all cycles with summary
router.get("/", async (_req, res: Response) => {
  const cycles = await prisma.auditCycle.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  type CycleWithItems = (typeof cycles)[number];
  type AuditItemType = CycleWithItems["items"][number];
  const data = cycles.map((c: CycleWithItems) => ({
    ...c,
    totalItems: c.items.length,
    verified: c.items.filter((i: AuditItemType) => i.status === "VERIFIED").length,
    discrepancies: c.items.filter((i: AuditItemType) => i.status !== "VERIFIED" && i.status !== "PENDING").length,
  }));
  res.json({ success: true, data });
});

// GET single cycle with all items
router.get("/:id", async (req: Request, res: Response) => {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { asset: true } } },
  });
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });
  res.json({ success: true, data: cycle });
});

// POST create new audit cycle
router.post("/", async (req: Request, res: Response) => {
  const { name, department, auditors, startDate, endDate } = req.body;
  if (!name || !startDate || !endDate)
    return res.status(400).json({ success: false, error: "name, startDate, and endDate are required" });

  const cycle = await prisma.auditCycle.create({
    data: {
      name,
      department: department || "All Departments",
      auditors: Array.isArray(auditors) ? auditors.join(", ") : (auditors || ""),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });
  res.status(201).json({ success: true, data: cycle, message: "Audit cycle created" });
});

// PATCH update an audit item (verify / mark missing / damaged)
router.patch("/:cycleId/items/:itemId", async (req: Request, res: Response) => {
  const item = await prisma.auditItem.update({
    where: { id: req.params.itemId },
    data: {
      ...req.body,
      verifiedAt: req.body.status && req.body.status !== "PENDING" ? new Date() : undefined,
    },
  }).catch(() => null);
  if (!item) return res.status(404).json({ success: false, error: "Audit item not found" });
  res.json({ success: true, data: item, message: "Audit item updated" });
});

// PATCH close audit cycle
router.patch("/:id/close", async (req: Request, res: Response) => {
  const cycle = await prisma.auditCycle.update({
    where: { id: req.params.id },
    data: { status: "CLOSED" },
  }).catch(() => null);
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });
  res.json({ success: true, data: cycle, message: "Audit cycle closed" });
});

export default router;
