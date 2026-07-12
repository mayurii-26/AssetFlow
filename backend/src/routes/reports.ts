import { Router, Request, Response } from "express";
import { assets } from "../data/seed";
import { allocations, transferRequests } from "./allocation";
import { bookings } from "./booking";

const router = Router();

// GET dashboard summary / KPIs — all values computed from live in-memory data
router.get("/summary", (_req: Request, res: Response) => {
  const available   = assets.filter(a => a.status === "Available").length;
  const allocated   = assets.filter(a => a.status === "Allocated").length;
  const maintenance = assets.filter(a => a.status === "Under Maintenance").length;
  const retired     = assets.filter(a => a.status === "Retired").length;
  const totalValue  = assets.reduce((sum, a) => sum + a.cost, 0);

  const pendingTransfers = transferRequests.filter(t => t.status === "Pending").length;

  const now = new Date();
  const activeBookings = bookings.filter(
    b => b.status === "Confirmed" && new Date(b.endTime) >= now
  ).length;

  // Upcoming returns = active allocations (assets currently out with employees)
  const upcomingReturns = allocations.filter(a => a.status === "Active").length;

  res.json({
    success: true,
    data: {
      totalAssets: assets.length,
      available,
      allocated,
      maintenance,
      retired,
      totalValue,
      pendingTransfers,
      activeBookings,
      upcomingReturns,
    },
  });
});

// GET asset utilization by department
router.get("/utilization", (_req: Request, res: Response) => {
  const deptMap: Record<string, { total: number; allocated: number }> = {};
  assets.forEach(a => {
    if (!deptMap[a.department]) deptMap[a.department] = { total: 0, allocated: 0 };
    deptMap[a.department].total += 1;
    if (a.status === "Allocated") deptMap[a.department].allocated += 1;
  });
  const data = Object.entries(deptMap).map(([dept, v]) => ({
    department: dept,
    total: v.total,
    allocated: v.allocated,
    utilization: Math.round((v.allocated / v.total) * 100),
  }));
  res.json({ success: true, data });
});

// GET status distribution for pie chart
router.get("/status-distribution", (_req: Request, res: Response) => {
  const statuses = ["Available", "Allocated", "Under Maintenance", "Retired"];
  const data = statuses.map(s => ({
    status: s,
    count: assets.filter(a => a.status === s).length,
  }));
  res.json({ success: true, data });
});

// GET category breakdown
router.get("/by-category", (_req: Request, res: Response) => {
  const catMap: Record<string, number> = {};
  assets.forEach(a => { catMap[a.category] = (catMap[a.category] || 0) + 1; });
  const data = Object.entries(catMap).map(([category, count]) => ({ category, count }));
  res.json({ success: true, data });
});

// GET assets near retirement (warranty expired or expiring within 90 days)
router.get("/near-retirement", (_req: Request, res: Response) => {
  const now = new Date();
  const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const data = assets.filter(a => {
    if (a.warrantyExpiry === "—") return false;
    const exp = new Date(a.warrantyExpiry);
    return exp <= ninetyDays;
  });
  res.json({ success: true, data, total: data.length });
});

export default router;
