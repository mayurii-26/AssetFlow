export type AssetStatus = "Available" | "Allocated" | "Under Maintenance" | "Retired" | "Pending Transfer";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface Asset {
  id: string;
  name: string;
  category: string;
  department: string;
  status: AssetStatus;
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
  priority: Priority;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  notes: string;
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

export interface Resource {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location: string;
  status: "Available" | "Booked" | "Under Maintenance";
}

export interface MaintenanceTask {
  id: string;
  assetId: string;
  assetName: string;
  issue: string;
  priority: Priority;
  technician: string;
  status: "Pending" | "Approved" | "Technician Assigned" | "In Progress" | "Resolved";
  createdAt: string;
  updatedAt: string;
  department: string;
  description: string;
}

export interface AuditItem {
  id: string;
  assetId: string;
  assetName: string;
  expectedLocation: string;
  actualLocation: string;
  condition: string;
  status: "Verified" | "Missing" | "Damaged" | "Discrepancy";
  verifiedBy: string;
  verifiedAt: string;
}

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
}
