import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET dashboard KPI summary
router.get("/summary", async (_req, res: Response) => {
  const [total, available, allocated, maintenance, retired, valueAgg, pendingTransfers, activeBookings] = await Promise.all([
    prisma.asset.count(),
    prisma.asset.count({ where: { status: "AVAILABLE" } }),
    prisma.asset.count({ where: { status: "ALLOCATED" } }),
    prisma.asset.count({ where: { status: "UNDER_MAINTENANCE" } }),
    prisma.asset.count({ where: { status: "RETIRED" } }),
    prisma.asset.aggregate({ _sum: { cost: true } }),
    prisma.transferRequest.count({ where: { status: "PENDING" } }),
    prisma.booking.count({ where: { status: "CONFIRMED", startTime: { gte: new Date() } } }),
  ]);
  res.json({
    success: true,
    data: {
      totalAssets: total,
      available, allocated, maintenance, retired,
      totalValue: Number(valueAgg._sum.cost ?? 0),
      pendingTransfers,
      activeBookings,
    },
  });
});

// GET utilization by department
router.get("/utilization", async (_req, res: Response) => {
  const departments = await prisma.department.findMany({ include: { assets: true } });
  type DeptWithAssets = (typeof departments)[number];
  type AssetItem = DeptWithAssets["assets"][number];
  const data = departments.map((d: DeptWithAssets) => ({
    department: d.name,
    total: d.assets.length,
    allocated: d.assets.filter((a: AssetItem) => a.status === "ALLOCATED").length,
    utilization: d.assets.length > 0 ? Math.round((d.assets.filter((a: AssetItem) => a.status === "ALLOCATED").length / d.assets.length) * 100) : 0,
  }));
  res.json({ success: true, data });
});

// GET status distribution
router.get("/status-distribution", async (_req, res: Response) => {
  const statuses = ["AVAILABLE", "ALLOCATED", "UNDER_MAINTENANCE", "RETIRED"] as const;
  const data = await Promise.all(
    statuses.map(async s => ({ status: s, count: await prisma.asset.count({ where: { status: s } }) }))
  );
  res.json({ success: true, data });
});

// GET assets by category
router.get("/by-category", async (_req, res: Response) => {
  const categories = await prisma.category.findMany({ include: { assets: true } });
  type CatWithAssets = (typeof categories)[number];
  const data = categories.map((c: CatWithAssets) => ({ category: c.name, count: c.assets.length }));
  res.json({ success: true, data });
});

// GET assets near retirement (warranty expiring within 90 days)
router.get("/near-retirement", async (_req, res: Response) => {
  const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const data = await prisma.asset.findMany({
    where: { warrantyExpiry: { lte: ninetyDaysFromNow, not: null } },
    include: { category: true, department: true },
    orderBy: { warrantyExpiry: "asc" },
  });
  res.json({ success: true, data, total: data.length });
});

// GET activity logs
router.get("/activity", async (req: Request, res: Response) => {
  const { module, severity, userId } = req.query;
  const data = await prisma.activityLog.findMany({
    where: {
      ...(module && { module: String(module) }),
      ...(severity && { severity: String(severity).toUpperCase() as "INFO" | "WARNING" | "ERROR" }),
      ...(userId && { userId: String(userId) }),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  res.json({ success: true, data, total: data.length });
});

export default router;
