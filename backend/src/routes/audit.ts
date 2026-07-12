import { Router, Request, Response } from "express";
import { AuditItem } from "../types";
import { addLog } from "./activity";

const router = Router();

interface AuditCycle {
  id: string;
  name: string;
  department: string;
  auditors: string[];
  startDate: string;
  endDate: string;
  status: "Active" | "Closed";
  items: AuditItem[];
}

const auditCycles: AuditCycle[] = [];

// GET all cycles
router.get("/", (_req: Request, res: Response) => {
  const summary = auditCycles.map(c => ({
    ...c,
    totalItems: c.items.length,
    verified: c.items.filter(i => i.status === "Verified").length,
    discrepancies: c.items.filter(i => i.status !== "Verified").length,
  }));
  res.json({ success: true, data: summary });
});

// GET single cycle with items
router.get("/:id", (req: Request, res: Response) => {
  const cycle = auditCycles.find(c => c.id === req.params.id);
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });
  res.json({ success: true, data: cycle });
});

// POST new audit cycle
router.post("/", (req: Request, res: Response) => {
  const { name, department, auditors, startDate, endDate } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ success: false, error: "name, startDate, and endDate are required" });
  }
  const cycle: AuditCycle = {
    id: `AUD-${new Date().getFullYear()}-${String(auditCycles.length + 1).padStart(2, "0")}`,
    name,
    department: department || "All Departments",
    auditors: auditors || [],
    startDate,
    endDate,
    status: "Active",
    items: [],
  };
  auditCycles.push(cycle);
  addLog("Audit Created", `${name} audit cycle started`, "System", "Audit", "info");
  res.status(201).json({ success: true, data: cycle, message: "Audit cycle created" });
});

// POST add item to audit cycle
router.post("/:id/items", (req: Request, res: Response) => {
  const cycle = auditCycles.find(c => c.id === req.params.id);
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });
  const { assetId, assetName, expectedLocation } = req.body;
  if (!assetName) return res.status(400).json({ success: false, error: "assetName is required" });
  const item: AuditItem = {
    id: `AUD-ITEM-${String(cycle.items.length + 1).padStart(3, "0")}`,
    assetId: assetId || "—",
    assetName,
    expectedLocation: expectedLocation || "—",
    actualLocation: "—",
    condition: "—",
    status: "Verified",
    verifiedBy: "—",
    verifiedAt: "—",
  };
  cycle.items.push(item);
  res.status(201).json({ success: true, data: item });
});

// PATCH update audit item
router.patch("/:cycleId/items/:itemId", (req: Request, res: Response) => {
  const cycle = auditCycles.find(c => c.id === req.params.cycleId);
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });
  const idx = cycle.items.findIndex(i => i.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ success: false, error: "Audit item not found" });
  cycle.items[idx] = { ...cycle.items[idx], ...req.body };
  if (req.body.status && req.body.status !== "Verified") {
    addLog(
      "Audit Discrepancy",
      `${cycle.items[idx].assetName} — ${req.body.status}`,
      req.body.verifiedBy || "System",
      "Audit",
      "error"
    );
  }
  res.json({ success: true, data: cycle.items[idx], message: "Audit item updated" });
});

// PATCH close audit cycle
router.patch("/:id/close", (req: Request, res: Response) => {
  const cycle = auditCycles.find(c => c.id === req.params.id);
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });
  cycle.status = "Closed";
  addLog("Audit Closed", `${cycle.name} audit cycle closed`, "System", "Audit", "info");
  res.json({ success: true, data: cycle, message: "Audit cycle closed" });
});

export default router;
