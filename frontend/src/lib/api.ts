/**
 * Shared API client for AssetFlow frontend.
 * Types aligned with Prisma DB schema (v2 — Prisma + MySQL backend).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("assetflow_token");
}

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const u = localStorage.getItem("assetflow_user");
    return u ? JSON.parse(u).id : null;
  } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res  = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok || data.success === false) {
    // Suppress auth errors when there's no token — layout will redirect to login
    if (res.status === 401 && !token) return Promise.reject(new Error("unauthenticated"));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

// ── Assets ────────────────────────────────────────────────────────────────────
// DB returns category & department as nested objects when using include

export interface Asset {
  id: string;
  name: string;
  // Prisma returns nested objects when include: { category, department }
  category:     { id: string; name: string; prefix: string } | string;
  categoryId:   string;
  department:   { id: string; name: string } | string;
  departmentId: string;
  status: "AVAILABLE" | "ALLOCATED" | "UNDER_MAINTENANCE" | "RETIRED" | "PENDING_TRANSFER";
  currentHolder: string;
  location: string;
  purchaseDate: string;
  vendor: string;
  cost: number;
  serialNumber: string;
  warrantyExpiry: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Safely extract asset category name whether response is nested or flat */
export function assetCategoryName(a: Asset): string {
  return typeof a.category === "object" ? a.category.name : (a.category ?? "—");
}
export function assetDepartmentName(a: Asset): string {
  return typeof a.department === "object" ? a.department.name : (a.department ?? "—");
}
/** Map Prisma SCREAMING_SNAKE status to display string */
export function assetStatusLabel(s: Asset["status"]): string {
  const map: Record<string, string> = {
    AVAILABLE: "Available", ALLOCATED: "Allocated",
    UNDER_MAINTENANCE: "Under Maintenance", RETIRED: "Retired",
    PENDING_TRANSFER: "Pending Transfer",
  };
  return map[s] ?? s;
}

export const assetsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ success: true; data: Asset[]; total: number }>(`/api/assets${qs}`);
  },
  get: (id: string) =>
    request<{ success: true; data: Asset }>(`/api/assets/${id}`),
  create: (body: {
    name: string; categoryId: string; departmentId: string; serialNumber: string;
    vendor?: string; purchaseDate?: string; cost?: number; location?: string;
    warrantyExpiry?: string; description?: string;
  }) =>
    request<{ success: true; data: Asset; message: string }>("/api/assets", {
      method: "POST", body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<Asset>) =>
    request<{ success: true; data: Asset; message: string }>(`/api/assets/${id}`, {
      method: "PATCH", body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<{ success: true; message: string }>(`/api/assets/${id}`, { method: "DELETE" }),
};

// ── Organization ──────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  head: string;
  parent: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  departmentId: string;
  department: { id: string; name: string } | string; // nested when include: { department }
  designation: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export function employeeDepartmentName(e: Employee): string {
  return typeof e.department === "object" ? e.department.name : (e.department ?? "—");
}

export interface Category {
  id: string;
  name: string;
  prefix: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const orgApi = {
  departments: {
    list: () =>
      request<{ success: true; data: Department[]; total: number }>("/api/organization/departments"),
    create: (body: { name: string; head?: string; parent?: string }) =>
      request<{ success: true; data: Department }>("/api/organization/departments", {
        method: "POST", body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Department>) =>
      request<{ success: true; data: Department }>(`/api/organization/departments/${id}`, {
        method: "PATCH", body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ success: true; message: string }>(`/api/organization/departments/${id}`, { method: "DELETE" }),
  },
  employees: {
    list: () =>
      request<{ success: true; data: Employee[]; total: number }>("/api/organization/employees"),
    create: (body: { name: string; email: string; departmentId: string; designation?: string }) =>
      request<{ success: true; data: Employee }>("/api/organization/employees", {
        method: "POST", body: JSON.stringify(body),
      }),
    update: (id: string, body: { name?: string; email?: string; departmentId?: string; designation?: string; status?: string }) =>
      request<{ success: true; data: Employee }>(`/api/organization/employees/${id}`, {
        method: "PATCH", body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ success: true; message: string }>(`/api/organization/employees/${id}`, { method: "DELETE" }),
  },
  categories: {
    list: () =>
      request<{ success: true; data: Category[]; total: number }>("/api/organization/categories"),
    create: (body: { name: string; prefix: string; description?: string }) =>
      request<{ success: true; data: Category }>("/api/organization/categories", {
        method: "POST", body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Category>) =>
      request<{ success: true; data: Category }>(`/api/organization/categories/${id}`, {
        method: "PATCH", body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ success: true; message: string }>(`/api/organization/categories/${id}`, { method: "DELETE" }),
  },
};

// ── Allocation & Transfer ─────────────────────────────────────────────────────

export interface Allocation {
  id: string;
  assetId: string;
  asset: { id: string; name: string } | null;
  allocatedById: string;
  toEmployee: string;
  department: string;
  reason: string | null;
  notes: string | null;
  status: "ACTIVE" | "RETURNED";
  allocatedAt: string;
  returnedAt: string | null;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  asset: { id: string; name: string } | null;
  requestedById: string;
  approvedById: string | null;
  fromEmployee: string;
  toEmployee: string;
  department: string;
  reason: string;
  notes: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

// Allocation request raised by an employee, approved/rejected by admin
export interface AllocationRequest {
  id: string;
  assetId: string;
  asset: { id: string; name: string } | null;
  requestedById: string;
  approvedById: string | null;
  toEmployee: string;
  department: string | null;
  reason: string | null;
  notes: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export const allocationApi = {
  list: () =>
    request<{ success: true; data: Allocation[]; total: number }>("/api/allocation"),
  create: (body: { assetId: string; toEmployee: string; allocatedById: string; department?: string; reason?: string }) =>
    request<{ success: true; data: Allocation; message: string }>("/api/allocation", {
      method: "POST", body: JSON.stringify(body),
    }),
  requests: {
    list: (params?: { status?: string; requestedById?: string }) => {
      const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
      return request<{ success: true; data: AllocationRequest[]; total: number }>(`/api/allocation/requests${qs}`);
    },
    create: (body: { assetId: string; requestedById: string; toEmployee: string; department?: string; reason?: string; priority?: string }) =>
      request<{ success: true; data: AllocationRequest; message: string }>("/api/allocation/requests", {
        method: "POST", body: JSON.stringify(body),
      }),
    approve: (id: string, approvedById?: string) =>
      request<{ success: true; data: AllocationRequest; message: string }>(`/api/allocation/requests/${id}/approve`, {
        method: "PATCH", body: JSON.stringify({ approvedById }),
      }),
    reject: (id: string, approvedById?: string) =>
      request<{ success: true; data: AllocationRequest; message: string }>(`/api/allocation/requests/${id}/reject`, {
        method: "PATCH", body: JSON.stringify({ approvedById }),
      }),
  },
  transfers: {
    list: () =>
      request<{ success: true; data: TransferRequest[]; total: number }>("/api/allocation/transfers"),
    create: (body: { assetId: string; toEmployee: string; requestedById: string; reason?: string; priority?: string }) =>
      request<{ success: true; data: TransferRequest; message: string }>("/api/allocation/transfers", {
        method: "POST", body: JSON.stringify(body),
      }),
    update: (id: string, status: "APPROVED" | "REJECTED", approvedById?: string) =>
      request<{ success: true; data: TransferRequest; message: string }>(
        `/api/allocation/transfers/${id}`,
        { method: "PATCH", body: JSON.stringify({ status, approvedById }) }
      ),
  },
};

// ── Maintenance ───────────────────────────────────────────────────────────────

export interface MaintenanceTask {
  id: string;
  assetId: string;
  asset: { id: string; name: string } | null;
  raisedById: string;
  issue: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  technician: string | null;
  status: "PENDING" | "APPROVED" | "TECHNICIAN_ASSIGNED" | "IN_PROGRESS" | "RESOLVED";
  department: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function maintenanceStatusLabel(s: MaintenanceTask["status"]): string {
  const map: Record<string, string> = {
    PENDING: "Pending", APPROVED: "Approved",
    TECHNICIAN_ASSIGNED: "Technician Assigned",
    IN_PROGRESS: "In Progress", RESOLVED: "Resolved",
  };
  return map[s] ?? s;
}

export const maintenanceApi = {
  list: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<{ success: true; data: MaintenanceTask[]; total: number }>(`/api/maintenance${qs}`);
  },
  create: (body: { assetId: string; issue: string; raisedById: string; priority?: string; technician?: string; department?: string; description?: string }) =>
    request<{ success: true; data: MaintenanceTask; message: string }>("/api/maintenance", {
      method: "POST", body: JSON.stringify(body),
    }),
  update: (id: string, body: { status?: string; technician?: string }) =>
    request<{ success: true; data: MaintenanceTask; message: string }>(`/api/maintenance/${id}`, {
      method: "PATCH", body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<{ success: true; message: string }>(`/api/maintenance/${id}`, { method: "DELETE" }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: "ALERT" | "APPROVAL" | "BOOKING" | "MAINTENANCE" | "AUDIT";
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  read: boolean;
  module: string;
  createdAt: string; // DB uses createdAt not timestamp
}

export const notificationsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ success: true; data: Notification[]; total: number; unread: number }>(
      `/api/notifications${qs}`
    );
  },
  markRead: (id: string) =>
    request<{ success: true; data: Notification }>(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    request<{ success: true; message: string }>("/api/notifications/mark-all-read", { method: "PATCH" }),
  remove: (id: string) =>
    request<{ success: true; message: string }>(`/api/notifications/${id}`, { method: "DELETE" }),
};

// ── Activity Logs ─────────────────────────────────────────────────────────────
// activity route is still in-memory (not Prisma), keeping old shape

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user: string;
  module: string;
  severity: "info" | "warning" | "error";
  timestamp: string;   // in-memory activity route
  createdAt?: string;  // Prisma activityLog route (if used)
}

export const activityApi = {
  list: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : "";
    return request<{ success: true; data: ActivityLog[]; total: number }>(`/api/activity${qs}`);
  },
};

// ── Reports / KPIs ────────────────────────────────────────────────────────────

export interface DashboardSummary {
  totalAssets: number;
  available: number;
  allocated: number;
  maintenance: number;
  retired: number;
  totalValue: number;
  pendingTransfers: number;
  activeBookings: number;
  upcomingReturns: number;
}

export const reportsApi = {
  summary: () =>
    request<{ success: true; data: DashboardSummary }>("/api/reports/summary"),
  utilization: () =>
    request<{ success: true; data: { department: string; total: number; allocated: number; utilization: number }[] }>(
      "/api/reports/utilization"
    ),
  statusDistribution: () =>
    request<{ success: true; data: { status: string; count: number }[] }>(
      "/api/reports/status-distribution"
    ),
  byCategory: () =>
    request<{ success: true; data: { category: string; count: number }[] }>(
      "/api/reports/by-category"
    ),
  nearRetirement: () =>
    request<{ success: true; data: Asset[]; total: number }>("/api/reports/near-retirement"),
};

// ── Booking ───────────────────────────────────────────────────────────────────

export interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  status: "AVAILABLE" | "BOOKED" | "UNDER_MAINTENANCE";
}

export interface Booking {
  id: string;
  resourceId: string;
  resource: { id: string; name: string } | null;
  bookedById: string;
  department: string;
  purpose: string;
  startTime: string;
  endTime: string;
  attendees: number;
  notes: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
}

export const bookingApi = {
  list: (params?: { resourceId?: string; bookedById?: string }) => {
    const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
    return request<{ success: true; data: Booking[]; total: number }>(`/api/booking${qs}`);
  },
  resources: () =>
    request<{ success: true; data: Resource[]; total: number }>("/api/booking/resources"),
  create: (body: { resourceId: string; bookedById: string; department?: string; purpose?: string; startTime: string; endTime: string; attendees?: number; notes?: string }) =>
    request<{ success: true; data: Booking; message: string }>("/api/booking", {
      method: "POST", body: JSON.stringify(body),
    }),
  approve: (id: string) =>
    request<{ success: true; data: Booking; message: string }>(`/api/booking/${id}/approve`, { method: "PATCH" }),
  reject: (id: string) =>
    request<{ success: true; data: Booking; message: string }>(`/api/booking/${id}/reject`, { method: "PATCH" }),
  cancel: (id: string) =>
    request<{ success: true; data: Booking; message: string }>(`/api/booking/${id}/cancel`, { method: "PATCH" }),
};
