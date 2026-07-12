import { Router, Request, Response } from "express";
import { AuditItem } from "../types";

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

const auditCycles: AuditCycle[] = [
  {
    id: "AUD-2024-Q3",
    name: "Q3 2024 Asset Audit",
    department: "All Departments",
    auditors: ["Pranav Joshi", "Ramesh Iyer"],
    startDate: "2024-07-08",
    endDate: "2024-07-15",
    status: "Active",
    items: [
      { id: "AUD-001", assetId: "AST-001", assetName: "MacBook Pro 16\"", expectedLocation: "Floor 3 - Bay 12", actualLocation: "Floor 3 - Bay 12", condition: "Good", status: "Verified", verifiedBy: "Pranav Joshi", verifiedAt: "2024-07-10" },
      { id: "AUD-002", assetId: "AST-002", assetName: "Dell Monitor 27\"", expectedLocation: "IT Storeroom A", actualLocation: "IT Storeroom A", condition: "Good", status: "Verified", verifiedBy: "Pranav Joshi", verifiedAt: "2024-07-10" },
      { id: "AUD-003", assetId: "AST-003", assetName: "Conference Projector", expectedLocation: "Conference Room B", actualLocation: "Conference Room A", condition: "Good", status: "Discrepancy", verifiedBy: "Ramesh Iyer", verifiedAt: "2024-07-10" },
      { id: "AUD-004", assetId: "AST-006", assetName: "iPhone 15 Pro", expectedLocation: "Sales Floor", actualLocation: "—", condition: "—", status: "Missing", verifiedBy: "—", verifiedAt: "—" },
    ],
  },
];

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

// PATCH update audit item (verify / mark missing / damaged)
router.patch("/:cycleId/items/:itemId", (req: Request, res: Response) => {
  const cycle = auditCycles.find(c => c.id === req.params.cycleId);
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });

  const idx = cycle.items.findIndex(i => i.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ success: false, error: "Audit item not found" });

  cycle.items[idx] = { ...cycle.items[idx], ...req.body };
  res.json({ success: true, data: cycle.items[idx], message: "Audit item updated" });
});

// PATCH close audit cycle
router.patch("/:id/close", (req: Request, res: Response) => {
  const cycle = auditCycles.find(c => c.id === req.params.id);
  if (!cycle) return res.status(404).json({ success: false, error: "Audit cycle not found" });
  cycle.status = "Closed";
  res.json({ success: true, data: cycle, message: "Audit cycle closed" });
});

// POST new audit cycle
router.post("/", (req: Request, res: Response) => {
  const { name, department, auditors, startDate, endDate } = req.body;
  if (!name || !startDate || !endDate) {
    return res.status(400).json({ success: false, error: "name, startDate, and endDate are required" });
  }
  const cycle: AuditCycle = {
    id: `AUD-${new Date().getFullYear()}-${String(auditCycles.length + 1).padStart(2, "0")}`,
    name, department: department || "All Departments",
    auditors: auditors || [],
    startDate, endDate,
    status: "Active",
    items: [],
  };
  auditCycles.push(cycle);
  res.status(201).json({ success: true, data: cycle, message: "Audit cycle created" });
});

export default router;
