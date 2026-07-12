import { Router, Request, Response } from "express";
import { assets } from "../data/seed";
import { Allocation, TransferRequest, ApiResponse } from "../types";

const router = Router();

const allocations: Allocation[] = [
  { id: "ALO-001", assetId: "AST-001", assetName: "MacBook Pro 16\"", fromEmployee: "IT Dept", toEmployee: "Arjun Mehta", department: "Engineering", date: "2024-01-20", reason: "New joiner allocation", status: "Active", notes: "Issued with charger" },
  { id: "ALO-002", assetId: "AST-006", assetName: "iPhone 15 Pro", fromEmployee: "IT Dept", toEmployee: "Priya Sharma", department: "Sales", date: "2024-02-15", reason: "Role requirement", status: "Active", notes: "" },
];

const transferRequests: TransferRequest[] = [
  { id: "TRF-001", assetId: "AST-002", assetName: "Dell Monitor 27\"", fromEmployee: "Neha Verma", toEmployee: "Sunita Rao", department: "Design", reason: "Project reassignment", priority: "High", status: "Pending", createdAt: "2024-07-01", notes: "" },
  { id: "TRF-002", assetId: "AST-007", assetName: "Cisco IP Phone", fromEmployee: "Amit Singh", toEmployee: "Meena Krishnan", department: "HR", reason: "Office relocation", priority: "Medium", status: "Approved", createdAt: "2024-06-28", notes: "" },
];

// GET all allocations
router.get("/", (_req: Request, res: Response) => {
  res.json({ success: true, data: allocations, total: allocations.length });
});

// POST allocate asset
router.post("/", (req: Request, res: Response) => {
  const { assetId, toEmployee, department, reason, notes } = req.body;
  if (!assetId || !toEmployee) return res.status(400).json({ success: false, error: "assetId and toEmployee are required" });

  const asset = assets.find(a => a.id === assetId);
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });
  if (asset.status === "Allocated") return res.status(409).json({ success: false, error: `Already allocated to ${asset.currentHolder}. Raise a transfer request.` });

  const alloc: Allocation = {
    id: `ALO-${String(allocations.length + 1).padStart(3, "0")}`,
    assetId, assetName: asset.name,
    fromEmployee: asset.currentHolder,
    toEmployee, department: department || asset.department,
    date: new Date().toISOString().split("T")[0],
    reason: reason || "—", status: "Active", notes: notes || "",
  };
  asset.status = "Allocated";
  asset.currentHolder = toEmployee;
  asset.updatedAt = new Date().toISOString();
  allocations.push(alloc);
  res.status(201).json({ success: true, data: alloc, message: "Asset allocated successfully" });
});

// GET transfer requests
router.get("/transfers", (_req: Request, res: Response) => {
  res.json({ success: true, data: transferRequests, total: transferRequests.length });
});

// POST transfer request
router.post("/transfers", (req: Request, res: Response) => {
  const { assetId, fromEmployee, toEmployee, reason, priority, notes } = req.body;
  if (!assetId || !toEmployee) return res.status(400).json({ success: false, error: "assetId and toEmployee are required" });

  const asset = assets.find(a => a.id === assetId);
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });

  const req_: TransferRequest = {
    id: `TRF-${String(transferRequests.length + 1).padStart(3, "0")}`,
    assetId, assetName: asset.name,
    fromEmployee: fromEmployee || asset.currentHolder,
    toEmployee, department: asset.department,
    reason: reason || "—", priority: priority || "Medium",
    status: "Pending",
    createdAt: new Date().toISOString().split("T")[0],
    notes: notes || "",
  };
  transferRequests.push(req_);
  res.status(201).json({ success: true, data: req_, message: "Transfer request submitted" });
});

// PATCH approve/reject transfer
router.patch("/transfers/:id", (req: Request, res: Response) => {
  const idx = transferRequests.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Transfer request not found" });
  const { status } = req.body;
  if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ success: false, error: "status must be Approved or Rejected" });

  transferRequests[idx].status = status;
  if (status === "Approved") {
    const asset = assets.find(a => a.id === transferRequests[idx].assetId);
    if (asset) { asset.currentHolder = transferRequests[idx].toEmployee; asset.updatedAt = new Date().toISOString(); }
  }
  res.json({ success: true, data: transferRequests[idx], message: `Transfer ${status.toLowerCase()}` });
});

export default router;
