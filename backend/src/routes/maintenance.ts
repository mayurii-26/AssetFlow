import { Router, Request, Response } from "express";
import { assets } from "../data/seed";
import { MaintenanceTask } from "../types";
import { addLog } from "./activity";

const router = Router();

const tasks: MaintenanceTask[] = [];

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
  const { assetId, assetName, issue, priority, department, description, technician } = req.body;
  if (!issue) return res.status(400).json({ success: false, error: "issue is required" });

  // assetId is optional — support free-text asset name too
  const asset = assetId ? assets.find(a => a.id === assetId) : null;
  const resolvedAssetName = asset?.name || assetName || "Unknown Asset";
  const resolvedDept = department || asset?.department || "—";

  const now = new Date().toISOString();
  const task: MaintenanceTask = {
    id: `MNT-${String(tasks.length + 1).padStart(3, "0")}`,
    assetId: assetId || "—",
    assetName: resolvedAssetName,
    issue,
    priority: priority || "Medium",
    technician: technician || "—",
    status: "Pending",
    createdAt: now,
    updatedAt: now,
    department: resolvedDept,
    description: description || "",
  };

  if (asset) {
    asset.status = "Under Maintenance";
    asset.updatedAt = now;
  }

  tasks.push(task);
  addLog("Maintenance Raised", `${task.issue} — ${resolvedAssetName} (${task.id})`, "System", "Maintenance", "warning");
  res.status(201).json({ success: true, data: task, message: "Maintenance request raised" });
});

// PATCH update status / assign technician
router.patch("/:id", (req: Request, res: Response) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Task not found" });

  const prev = tasks[idx];
  tasks[idx] = { ...prev, ...req.body, updatedAt: new Date().toISOString() };

  // Auto-restore asset status when resolved
  if (req.body.status === "Resolved" && prev.status !== "Resolved") {
    const asset = assets.find(a => a.id === prev.assetId);
    if (asset) {
      asset.status = "Available";
      asset.updatedAt = new Date().toISOString();
    }
    addLog("Maintenance Resolved", `${tasks[idx].assetName} (${tasks[idx].id}) marked resolved`, "System", "Maintenance", "info");
  } else if (req.body.status && req.body.status !== prev.status) {
    addLog("Maintenance Updated", `${tasks[idx].assetName} status → ${req.body.status}`, "System", "Maintenance", "info");
  }

  res.json({ success: true, data: tasks[idx], message: "Maintenance task updated" });
});

// DELETE task
router.delete("/:id", (req: Request, res: Response) => {
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Task not found" });
  const [removed] = tasks.splice(idx, 1);
  addLog("Maintenance Deleted", `${removed.assetName} maintenance request removed`, "System", "Maintenance", "info");
  res.json({ success: true, message: "Task deleted" });
});

export default router;
