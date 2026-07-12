import { Router, Request, Response } from "express";
import { departments, employees, categories } from "../data/seed";
import { Department, Employee, Category } from "../types";

const router = Router();

/* ── DEPARTMENTS ── */
router.get("/departments", (_req: Request, res: Response) => {
  res.json({ success: true, data: departments, total: departments.length });
});

router.post("/departments", (req: Request, res: Response) => {
  const { name, head, parent } = req.body;
  if (!name) return res.status(400).json({ success: false, error: "name is required" });
  const dept: Department = {
    id: `DEP-${String(departments.length + 1).padStart(3, "0")}`,
    name, head: head || "—", parent: parent || "—",
    status: "Active",
    createdAt: new Date().toISOString(),
  };
  departments.push(dept);
  res.status(201).json({ success: true, data: dept });
});

router.patch("/departments/:id", (req: Request, res: Response) => {
  const idx = departments.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Department not found" });
  departments[idx] = { ...departments[idx], ...req.body };
  res.json({ success: true, data: departments[idx] });
});

router.delete("/departments/:id", (req: Request, res: Response) => {
  const idx = departments.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Department not found" });
  departments.splice(idx, 1);
  res.json({ success: true, message: "Department deleted" });
});

/* ── EMPLOYEES ── */
router.get("/employees", (_req: Request, res: Response) => {
  res.json({ success: true, data: employees, total: employees.length });
});

router.post("/employees", (req: Request, res: Response) => {
  const { name, department, designation, email } = req.body;
  if (!name || !email) return res.status(400).json({ success: false, error: "name and email are required" });
  const emp: Employee = {
    id: `EMP-${String(employees.length + 1).padStart(3, "0")}`,
    name, department: department || "—", designation: designation || "—",
    email, status: "Active",
    createdAt: new Date().toISOString(),
  };
  employees.push(emp);
  res.status(201).json({ success: true, data: emp });
});

router.patch("/employees/:id", (req: Request, res: Response) => {
  const idx = employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Employee not found" });
  employees[idx] = { ...employees[idx], ...req.body };
  res.json({ success: true, data: employees[idx] });
});

router.delete("/employees/:id", (req: Request, res: Response) => {
  const idx = employees.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Employee not found" });
  employees.splice(idx, 1);
  res.json({ success: true, message: "Employee deleted" });
});

/* ── CATEGORIES ── */
router.get("/categories", (_req: Request, res: Response) => {
  res.json({ success: true, data: categories, total: categories.length });
});

router.post("/categories", (req: Request, res: Response) => {
  const { name, prefix, description } = req.body;
  if (!name || !prefix) return res.status(400).json({ success: false, error: "name and prefix are required" });
  const cat: Category = {
    id: `CAT-${String(categories.length + 1).padStart(3, "0")}`,
    name, prefix, description: description || "",
    status: "Active",
    createdAt: new Date().toISOString(),
  };
  categories.push(cat);
  res.status(201).json({ success: true, data: cat });
});

router.delete("/categories/:id", (req: Request, res: Response) => {
  const idx = categories.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: "Category not found" });
  categories.splice(idx, 1);
  res.json({ success: true, message: "Category deleted" });
});

export default router;
