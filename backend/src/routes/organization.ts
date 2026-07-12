import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// ── DEPARTMENTS ──────────────────────────────
router.get("/departments", async (_req, res: Response) => {
  const data = await prisma.department.findMany({ orderBy: { name: "asc" } });
  res.json({ success: true, data, total: data.length });
});

router.post("/departments", async (req: Request, res: Response) => {
  const { name, head, parent } = req.body;
  if (!name) return res.status(400).json({ success: false, error: "name is required" });
  const dept = await prisma.department.create({ data: { name, head: head || "—", parent: parent || null } });
  res.status(201).json({ success: true, data: dept });
});

router.patch("/departments/:id", async (req: Request, res: Response) => {
  const dept = await prisma.department.update({ where: { id: req.params.id }, data: req.body }).catch(() => null);
  if (!dept) return res.status(404).json({ success: false, error: "Department not found" });
  res.json({ success: true, data: dept });
});

router.delete("/departments/:id", async (req: Request, res: Response) => {
  await prisma.department.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ success: true, message: "Department deleted" });
});

// ── EMPLOYEES ────────────────────────────────
router.get("/employees", async (req: Request, res: Response) => {
  const { departmentId } = req.query;
  const data = await prisma.employee.findMany({
    where: departmentId ? { departmentId: String(departmentId) } : undefined,
    include: { department: true },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data, total: data.length });
});

router.post("/employees", async (req: Request, res: Response) => {
  const { name, departmentId, designation, email } = req.body;
  if (!name || !email || !departmentId)
    return res.status(400).json({ success: false, error: "name, email, and departmentId are required" });
  const count = await prisma.employee.count();
  const emp = await prisma.employee.create({
    data: {
      employeeCode: `EMP-${String(count + 1).padStart(3, "0")}`,
      name, departmentId, designation: designation || "—", email,
    },
  }).catch((e: Error) => ({ error: e.message }));
  if ("error" in emp) return res.status(409).json({ success: false, error: emp.error });
  res.status(201).json({ success: true, data: emp });
});

router.patch("/employees/:id", async (req: Request, res: Response) => {
  const emp = await prisma.employee.update({ where: { id: req.params.id }, data: req.body }).catch(() => null);
  if (!emp) return res.status(404).json({ success: false, error: "Employee not found" });
  res.json({ success: true, data: emp });
});

router.delete("/employees/:id", async (req: Request, res: Response) => {
  await prisma.employee.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ success: true, message: "Employee deleted" });
});

// ── CATEGORIES ───────────────────────────────
router.get("/categories", async (_req, res: Response) => {
  const data = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json({ success: true, data, total: data.length });
});

router.post("/categories", async (req: Request, res: Response) => {
  const { name, prefix, description } = req.body;
  if (!name || !prefix) return res.status(400).json({ success: false, error: "name and prefix are required" });
  const cat = await prisma.category.create({ data: { name, prefix: prefix.toUpperCase(), description: description || "" } })
    .catch((e: Error) => ({ error: e.message }));
  if ("error" in cat) return res.status(409).json({ success: false, error: cat.error });
  res.status(201).json({ success: true, data: cat });
});

router.patch("/categories/:id", async (req: Request, res: Response) => {
  const cat = await prisma.category.update({ where: { id: req.params.id }, data: req.body }).catch(() => null);
  if (!cat) return res.status(404).json({ success: false, error: "Category not found" });
  res.json({ success: true, data: cat });
});

router.delete("/categories/:id", async (req: Request, res: Response) => {
  await prisma.category.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ success: true, message: "Category deleted" });
});

// ── USER ROLE MANAGEMENT (Admin only) ────────
// PATCH /api/organization/users/:id/role  — promote/demote a user
router.patch("/users/:id/role", async (req: Request, res: Response) => {
  const { role } = req.body;
  const validRoles = ["ADMIN", "DEPARTMENT_HEAD", "ASSET_MANAGER", "EMPLOYEE"];
  if (!role || !validRoles.includes(role.toUpperCase()))
    return res.status(400).json({ success: false, error: `role must be one of: ${validRoles.join(", ")}` });

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role: role.toUpperCase() as "ADMIN" | "DEPARTMENT_HEAD" | "ASSET_MANAGER" | "EMPLOYEE" },
    select: { id: true, name: true, email: true, role: true, organization: true },
  }).catch(() => null);

  if (!user) return res.status(404).json({ success: false, error: "User not found" });
  res.json({ success: true, data: user, message: `User role updated to ${role}` });
});

// GET /api/organization/users — list all users (for admin employee directory)
router.get("/users", async (_req, res: Response) => {
  const data = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, organization: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  res.json({ success: true, data, total: data.length });
});

export default router;
