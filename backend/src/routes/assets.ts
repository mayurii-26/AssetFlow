import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/assets
router.get("/", async (req: Request, res: Response) => {
  const { status, search } = req.query;
  const where: Record<string, unknown> = {};
  if (status && status !== "All") where.status = String(status).toUpperCase().replace(/ /g, "_");
  if (search) {
    where.OR = [
      { name: { contains: String(search) } },
      { id: { contains: String(search) } },
    ];
  }
  const data = await prisma.asset.findMany({
    where,
    include: { category: true, department: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data, total: data.length });
});

// GET /api/assets/:id
router.get("/:id", async (req: Request, res: Response) => {
  const asset = await prisma.asset.findUnique({
    where: { id: req.params.id },
    include: { category: true, department: true, allocations: true, maintenanceTasks: true },
  });
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });
  res.json({ success: true, data: asset });
});

// POST /api/assets
router.post("/", async (req: Request, res: Response) => {
  const { name, categoryId, departmentId, vendor, purchaseDate, cost, serialNumber, warrantyExpiry, location, description } = req.body;
  if (!name || !categoryId || !departmentId || !serialNumber)
    return res.status(400).json({ success: false, error: "name, categoryId, departmentId and serialNumber are required" });

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return res.status(404).json({ success: false, error: "Category not found" });

  const count = await prisma.asset.count({ where: { categoryId } });
  const id = `${category.prefix}-${String(count + 1).padStart(4, "0")}`;

  const asset = await prisma.asset.create({
    data: {
      id,
      name,
      categoryId,
      departmentId,
      vendor: vendor || "—",
      purchaseDate: new Date(purchaseDate || Date.now()),
      cost: Number(cost) || 0,
      serialNumber,
      warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry) : null,
      location: location || "—",
      description: description || "",
    },
  });
  res.status(201).json({ success: true, data: asset, message: "Asset registered successfully" });
});

// PATCH /api/assets/:id
router.patch("/:id", async (req: Request, res: Response) => {
  const { purchaseDate, warrantyExpiry, cost, ...rest } = req.body;
  const asset = await prisma.asset.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
      ...(warrantyExpiry && { warrantyExpiry: new Date(warrantyExpiry) }),
      ...(cost !== undefined && { cost: Number(cost) }),
    },
  }).catch(() => null);
  if (!asset) return res.status(404).json({ success: false, error: "Asset not found" });
  res.json({ success: true, data: asset, message: "Asset updated" });
});

// DELETE /api/assets/:id
router.delete("/:id", async (req: Request, res: Response) => {
  await prisma.asset.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ success: true, message: "Asset deleted" });
});

export default router;
