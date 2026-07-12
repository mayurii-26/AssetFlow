import { Router, Request, Response } from "express";
import { assets } from "../data/seed";
import { MaintenanceTask } from "../types";

const router = Router();

const tasks: MaintenanceTask[] = [
  { id: "MNT-001", assetId: "AST-004", assetName: "HP LaserJet Pro", issue: "Paper jam & roller replacement", priority: "High", technician: "Suresh Nair", status: "In Progress", createdAt: "2024-07-01T10:00:00Z", updatedAt: "2024-07-05T10:00:00Z", department: "Finance", description: "Frequent paper jams, roller worn out" },
  { id: "MNT-002", assetId: "AST-008", assetName: "Dell PowerEdge Server", issue: "Fan noise — possible bearing failure", priority: "Medium", technician: "—", status: "Pending", createdAt: "2024-07-06T10:00:00Z", updatedAt: "2024-07-06T10:00:00Z", department: "IT", description: "Loud fan noise from rack unit 4" },
  { id: "MNT-003", assetId: "AST-003", assetName: "Conference Projector", issue: "Lamp replacement", priority: "Low", technician: "—", status: "Pending", createdAt: "2024-07-07T10:00:00Z", updatedAt: "2024-07-07T10:00:00Z", department: "Admin", description: "Lamp hours exceeded 3000h" },
  { id: "MNT-004", assetId: "AST-013", assetName: "Cisco Network Switch", issue: "Port 12 not responding", priority: "High", technician: "Pranav Joshi", status: "Resolved", createdAt: "2024-06-20T10:00:00Z", updatedAt: "2024-06-25T10:00:00Z", department: "IT", description: "Physical port damage, replaced SFP module" },
];

// GET all tasks — optional status filter
router.get("/", (req: Request, res: Response) => {
  const { status } = req.query;
  const result = status ? tasks.filter(t => t.status === status) : tasks;
  res.json({ success: true, data: result, total: result.length });
});

// GET single task
router.get("/:id", (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ success: false, error: "Task not found" });
  res.json({ success: true, data: task });
});

// POST create task
router.post("/", (req: Request, res: Response) => {
  const { assetId, issue, priority, department, description, technician } = req.body;
  if (!assetId || !issue) return res.status(400).json({ success: false, error: "assetId and issue are required" });

  const asset = assets.find(a => a.id === assetId);
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });

  const now = new Date().toISOString();
  const task: MaintenanceTask = {
    id: `MNT-${String(tasks.length + 1).padStart(3, "0")}`,
    assetId, assetName: asset.name,
    issue, priority: priority || "Medium",
    technician: technician || "—",
    status: "Pending",
    createdAt: now, updatedAt: now,
    department: department || asset.department,
    description: description || "",
  };
  // Mark asset under maintenance
  asset.status = "Under Maintenance";
  asset.updatedAt = now;
  tasks.push(task);
  res.status(201).json({ success: true, data: task, message: "Maintenance request raised" });
});

// PATCH update status / assign technician
router.patch("/:id", (req: Request, res: Response) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Task not found" });

  const prev = tasks[idx];
  tasks[idx] = { ...prev, ...req.body, updatedAt: new Date().toISOString() };

  // Auto-restore asset status to Available when Resolved
  if (req.body.status === "Resolved" && prev.status !== "Resolved") {
    const asset = assets.find(a => a.id === prev.assetId);
    if (asset) { asset.status = "Available"; asset.updatedAt = new Date().toISOString(); }
  }

  res.json({ success: true, data: tasks[idx], message: "Maintenance task updated" });
});

// DELETE task
router.delete("/:id", (req: Request, res: Response) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Task not found" });
  tasks.splice(idx, 1);
  res.json({ success: true, message: "Task deleted" });
});

export default router;
