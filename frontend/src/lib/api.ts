/**
 * Shared API client for AssetFlow frontend.
 * All fetch helpers attach the JWT token from localStorage automatically.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("assetflow_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

// ── Assets ────────────────────────────────────────────────────────────────────

export interface Asset {
  id: string;
  name: string;
  category: string;
  department: string;
  status: "Available" | "Allocated" | "Under Maintenance" | "Retired" | "Pending Transfer";
  currentHolder: string;
  location: string;
  purchaseDate: string;
  vendor: string;
  cost: number;
  serialNumber: string;
  warrantyExpiry: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const assetsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ success: true; data: Asset[]; total: number }>(`/api/assets${qs}`);
  },
  get: (id: string) =>
    request<{ success: true; data: Asset }>(`/api/assets/${id}`),
  create: (body: Partial<Asset>) =>
    request<{ success: true; data: Asset; message: string }>("/api/assets", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<Asset>) =>
    request<{ success: true; data: Asset; message: string }>(`/api/assets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<{ success: true; message: string }>(`/api/assets/${id}`, { method: "DELETE" }),
};

// ── Organization ──────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  name: string;
  head: string;
  parent: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  prefix: string;
  description: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export const orgApi = {
  departments: {
    list: () =>
      request<{ success: true; data: Department[]; total: number }>("/api/organization/departments"),
    create: (body: Partial<Department>) =>
      request<{ success: true; data: Department }>("/api/organization/departments", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Department>) =>
      request<{ success: true; data: Department }>(`/api/organization/departments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ success: true; message: string }>(`/api/organization/departments/${id}`, {
        method: "DELETE",
      }),
  },
  employees: {
    list: () =>
      request<{ success: true; data: Employee[]; total: number }>("/api/organization/employees"),
    create: (body: Partial<Employee>) =>
      request<{ success: true; data: Employee }>("/api/organization/employees", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Employee>) =>
      request<{ success: true; data: Employee }>(`/api/organization/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ success: true; message: string }>(`/api/organization/employees/${id}`, {
        method: "DELETE",
      }),
  },
  categories: {
    list: () =>
      request<{ success: true; data: Category[]; total: number }>("/api/organization/categories"),
    create: (body: Partial<Category>) =>
      request<{ success: true; data: Category }>("/api/organization/categories", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: Partial<Category>) =>
      request<{ success: true; data: Category }>(`/api/organization/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<{ success: true; message: string }>(`/api/organization/categories/${id}`, {
        method: "DELETE",
      }),
  },
};

// ── Allocation & Transfer ─────────────────────────────────────────────────────

export interface Allocation {
  id: string;
  assetId: string;
  assetName: string;
  fromEmployee: string;
  toEmployee: string;
  department: string;
  date: string;
  reason: string;
  status: "Active" | "Returned";
  notes: string;
}

export interface TransferRequest {
  id: string;
  assetId: string;
  assetName: string;
  fromEmployee: string;
  toEmployee: string;
  department: string;
  reason: string;
  priority: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  notes: string;
}

export const allocationApi = {
  list: () =>
    request<{ success: true; data: Allocation[]; total: number }>("/api/allocation"),
  create: (body: Partial<Allocation>) =>
    request<{ success: true; data: Allocation; message: string }>("/api/allocation", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  transfers: {
    list: () =>
      request<{ success: true; data: TransferRequest[]; total: number }>("/api/allocation/transfers"),
    create: (body: Partial<TransferRequest>) =>
      request<{ success: true; data: TransferRequest; message: string }>("/api/allocation/transfers", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, status: "Approved" | "Rejected") =>
      request<{ success: true; data: TransferRequest; message: string }>(
        `/api/allocation/transfers/${id}`,
        { method: "PATCH", body: JSON.stringify({ status }) }
      ),
  },
};

// ── Maintenance ───────────────────────────────────────────────────────────────

export interface MaintenanceTask {
  id: string;
  assetId: string;
  assetName: string;
  issue: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  technician: string;
  status: "Pending" | "Approved" | "Technician Assigned" | "In Progress" | "Resolved";
  createdAt: string;
  updatedAt: string;
  department: string;
  description: string;
}

export const maintenanceApi = {
  list: (status?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    return request<{ success: true; data: MaintenanceTask[]; total: number }>(`/api/maintenance${qs}`);
  },
  create: (body: Partial<MaintenanceTask>) =>
    request<{ success: true; data: MaintenanceTask; message: string }>("/api/maintenance", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: Partial<MaintenanceTask>) =>
    request<{ success: true; data: MaintenanceTask; message: string }>(`/api/maintenance/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<{ success: true; message: string }>(`/api/maintenance/${id}`, { method: "DELETE" }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: "alert" | "approval" | "booking" | "maintenance" | "audit";
  title: string;
  description: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  read: boolean;
  module: string;
}

export const notificationsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ success: true; data: Notification[]; total: number; unread: number }>(
      `/api/notifications${qs}`
    );
  },
  markRead: (id: string) =>
    request<{ success: true; data: Notification }>(`/api/notifications/${id}/read`, {
      method: "PATCH",
    }),
  markAllRead: () =>
    request<{ success: true; message: string }>("/api/notifications/mark-all-read", {
      method: "PATCH",
    }),
  remove: (id: string) =>
    request<{ success: true; message: string }>(`/api/notifications/${id}`, { method: "DELETE" }),
};

// ── Activity Logs ─────────────────────────────────────────────────────────────

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user: string;
  module: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
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
  status: "Available" | "Booked" | "Under Maintenance";
}

export interface Booking {
  id: string;
  resourceId: string;
  resourceName: string;
  bookedBy: string;
  department: string;
  purpose: string;
  startTime: string;
  endTime: string;
  attendees: number;
  status: "Pending" | "Confirmed" | "Cancelled";
  notes: string;
}

export const bookingApi = {
  list: (resourceId?: string) => {
    const qs = resourceId ? `?resourceId=${resourceId}` : "";
    return request<{ success: true; data: Booking[]; total: number }>(`/api/booking${qs}`);
  },
  resources: () =>
    request<{ success: true; data: Resource[]; total: number }>("/api/booking/resources"),
  create: (body: Partial<Booking>) =>
    request<{ success: true; data: Booking; message: string }>("/api/booking", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  cancel: (id: string) =>
    request<{ success: true; data: Booking; message: string }>(`/api/booking/${id}/cancel`, {
      method: "PATCH",
    }),
};
