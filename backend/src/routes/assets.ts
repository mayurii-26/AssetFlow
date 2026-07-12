import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { assets } from "../data/seed";
import { Asset, ApiResponse } from "../types";

const router = Router();

// GET /api/assets — list with optional filters
router.get("/", (req: Request, res: Response) => {
  const { status, category, department, search } = req.query;
  let result = [...assets];

  if (status && status !== "All") result = result.filter(a => a.status === status);
  if (category && category !== "All") result = result.filter(a => a.category === category);
  if (department && department !== "All") result = result.filter(a => a.department === department);
  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(a => a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q));
  }

  const response: ApiResponse<Asset[]> = { success: true, data: result, total: result.length };
  res.json(response);
});

// GET /api/assets/:id
router.get("/:id", (req: Request, res: Response) => {
  const asset = assets.find(a => a.id === req.params.id);
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });
  res.json({ success: true, data: asset });
});

// POST /api/assets
router.post("/", (req: Request, res: Response) => {
  const { name, category, department, vendor, purchaseDate, cost, serialNumber, warrantyExpiry, location, description } = req.body;
  if (!name || !category || !department) {
    return res.status(400).json({ success: false, error: "name, category, and department are required" });
  }
  const now = new Date().toISOString();
  const newAsset: Asset = {
    id: `AST-${String(assets.length + 1).padStart(3, "0")}`,
    name, category, department,
    status: "Available",
    currentHolder: "—",
    location: location || "—",
    purchaseDate: purchaseDate || now.split("T")[0],
    vendor: vendor || "—",
    cost: Number(cost) || 0,
    serialNumber: serialNumber || "—",
    warrantyExpiry: warrantyExpiry || "—",
    description: description || "",
    createdAt: now,
    updatedAt: now,
  };
  assets.push(newAsset);
  res.status(201).json({ success: true, data: newAsset, message: "Asset registered successfully" });
});

// PATCH /api/assets/:id
router.patch("/:id", (req: Request, res: Response) => {
  const idx = assets.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Asset not found" });
  assets[idx] = { ...assets[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, data: assets[idx], message: "Asset updated" });
});

// DELETE /api/assets/:id
router.delete("/:id", (req: Request, res: Response) => {
  const idx = assets.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Asset not found" });
  assets.splice(idx, 1);
  res.json({ success: true, message: "Asset deleted" });
});

export default router;
