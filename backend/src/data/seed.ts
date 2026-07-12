import { Asset, Department, Employee, Category, Allocation, TransferRequest, Booking, Resource, MaintenanceTask, AuditItem, Notification } from "../types";

export const assets: Asset[] = [
  { id: "AST-001", name: "MacBook Pro 16\"", category: "Laptops", department: "Engineering", status: "Allocated", currentHolder: "Arjun Mehta", location: "Floor 3 - Bay 12", purchaseDate: "2024-01-15", vendor: "Apple India", cost: 285000, serialNumber: "SN-MBP-2024-001", warrantyExpiry: "2027-01-15", description: "M3 Pro chip, 36GB RAM", createdAt: "2024-01-15T10:00:00Z", updatedAt: "2024-01-20T10:00:00Z" },
  { id: "AST-002", name: "Dell Monitor 27\"", category: "Monitors", department: "Design", status: "Available", currentHolder: "—", location: "IT Storeroom A", purchaseDate: "2023-11-20", vendor: "Dell Technologies", cost: 42000, serialNumber: "SN-DLM-2023-002", warrantyExpiry: "2026-11-20", description: "4K IPS Display", createdAt: "2023-11-20T10:00:00Z", updatedAt: "2023-11-20T10:00:00Z" },
  { id: "AST-003", name: "Conference Projector", category: "AV Equipment", department: "Admin", status: "Available", currentHolder: "—", location: "Conference Room B", purchaseDate: "2023-06-10", vendor: "Epson India", cost: 68000, serialNumber: "SN-PRJ-2023-003", warrantyExpiry: "2026-06-10", description: "4K laser projector", createdAt: "2023-06-10T10:00:00Z", updatedAt: "2023-06-10T10:00:00Z" },
  { id: "AST-004", name: "HP LaserJet Pro", category: "Printers", department: "Finance", status: "Under Maintenance", currentHolder: "Finance Dept", location: "Floor 2 - Finance Bay", purchaseDate: "2022-03-05", vendor: "HP India", cost: 35000, serialNumber: "SN-HPP-2022-004", warrantyExpiry: "2025-03-05", description: "Color laser printer", createdAt: "2022-03-05T10:00:00Z", updatedAt: "2024-07-01T10:00:00Z" },
  { id: "AST-005", name: "Toyota Innova Crysta", category: "Vehicles", department: "Operations", status: "Allocated", currentHolder: "Ravi Kumar", location: "Parking B2", purchaseDate: "2023-08-20", vendor: "Toyota Kirloskar", cost: 1850000, serialNumber: "MH02-AB-1234", warrantyExpiry: "2026-08-20", description: "Company vehicle for field ops", createdAt: "2023-08-20T10:00:00Z", updatedAt: "2024-01-01T10:00:00Z" },
  { id: "AST-006", name: "iPhone 15 Pro", category: "Mobile Devices", department: "Sales", status: "Allocated", currentHolder: "Priya Sharma", location: "Sales Floor", purchaseDate: "2024-02-10", vendor: "Apple India", cost: 134900, serialNumber: "SN-IPH-2024-006", warrantyExpiry: "2026-02-10", description: "256GB Space Black", createdAt: "2024-02-10T10:00:00Z", updatedAt: "2024-02-15T10:00:00Z" },
  { id: "AST-007", name: "Cisco IP Phone 8800", category: "Telecom", department: "HR", status: "Available", currentHolder: "—", location: "IT Storeroom A", purchaseDate: "2023-01-15", vendor: "Cisco Systems", cost: 22000, serialNumber: "SN-CSC-2023-007", warrantyExpiry: "2026-01-15", description: "VoIP desk phone", createdAt: "2023-01-15T10:00:00Z", updatedAt: "2023-01-15T10:00:00Z" },
  { id: "AST-008", name: "Dell PowerEdge Server", category: "Servers", department: "IT", status: "Allocated", currentHolder: "IT Dept", location: "Server Room", purchaseDate: "2023-04-01", vendor: "Dell Technologies", cost: 980000, serialNumber: "SN-SRV-2023-008", warrantyExpiry: "2028-04-01", description: "R740 16-core 128GB RAM", createdAt: "2023-04-01T10:00:00Z", updatedAt: "2023-04-01T10:00:00Z" },
  { id: "AST-009", name: "Ergonomic Chair Steelcase", category: "Furniture", department: "Engineering", status: "Allocated", currentHolder: "Neha Verma", location: "Floor 3 - Bay 5", purchaseDate: "2024-03-20", vendor: "Steelcase India", cost: 45000, serialNumber: "SN-CHR-2024-009", warrantyExpiry: "2034-03-20", description: "Leap V2 ergonomic chair", createdAt: "2024-03-20T10:00:00Z", updatedAt: "2024-03-20T10:00:00Z" },
  { id: "AST-010", name: "iPad Pro 12.9\"", category: "Tablets", department: "Design", status: "Available", currentHolder: "—", location: "IT Storeroom B", purchaseDate: "2024-01-05", vendor: "Apple India", cost: 112000, serialNumber: "SN-IPD-2024-010", warrantyExpiry: "2026-01-05", description: "M2 chip with Apple Pencil", createdAt: "2024-01-05T10:00:00Z", updatedAt: "2024-01-05T10:00:00Z" },
];

export const departments: Department[] = [
  { id: "DEP-001", name: "Engineering", head: "Rajesh Gupta", parent: "Technology", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "DEP-002", name: "Design", head: "Sunita Rao", parent: "Technology", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "DEP-003", name: "Finance", head: "Vikram Patel", parent: "Operations", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "DEP-004", name: "HR", head: "Meena Krishnan", parent: "Admin", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "DEP-005", name: "Sales", head: "Aditya Sharma", parent: "Business", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "DEP-006", name: "Operations", head: "Suresh Nair", parent: "Admin", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "DEP-007", name: "IT", head: "Pranav Joshi", parent: "Technology", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
];

export const employees: Employee[] = [
  { id: "EMP-001", name: "Arjun Mehta", department: "Engineering", designation: "Senior Engineer", email: "arjun.mehta@assetflow.com", status: "Active", createdAt: "2022-03-01T00:00:00Z" },
  { id: "EMP-002", name: "Priya Sharma", department: "Sales", designation: "Sales Manager", email: "priya.sharma@assetflow.com", status: "Active", createdAt: "2021-07-15T00:00:00Z" },
  { id: "EMP-003", name: "Ravi Kumar", department: "Operations", designation: "Field Officer", email: "ravi.kumar@assetflow.com", status: "Active", createdAt: "2023-01-10T00:00:00Z" },
  { id: "EMP-004", name: "Neha Verma", department: "Engineering", designation: "UX Designer", email: "neha.verma@assetflow.com", status: "Active", createdAt: "2023-06-01T00:00:00Z" },
  { id: "EMP-005", name: "Pranav Joshi", department: "IT", designation: "IT Manager", email: "pranav.joshi@assetflow.com", status: "Active", createdAt: "2020-04-01T00:00:00Z" },
];

export const categories: Category[] = [
  { id: "CAT-001", name: "Laptops", prefix: "LAP", description: "Portable computers", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "CAT-002", name: "Monitors", prefix: "MON", description: "Display screens", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "CAT-003", name: "AV Equipment", prefix: "AVE", description: "Audio/Visual devices", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "CAT-004", name: "Vehicles", prefix: "VEH", description: "Company vehicles", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
  { id: "CAT-005", name: "Mobile Devices", prefix: "MOB", description: "Smartphones and tablets", status: "Active", createdAt: "2020-01-01T00:00:00Z" },
];

export const resources: Resource[] = [
  { id: "RES-001", name: "Conference Room A", type: "Meeting Room", capacity: 12, location: "Floor 2", status: "Available" },
  { id: "RES-002", name: "Projector Unit 1", type: "AV Equipment", capacity: 1, location: "IT Storeroom", status: "Available" },
  { id: "RES-003", name: "Conference Room B", type: "Meeting Room", capacity: 20, location: "Floor 1", status: "Available" },
  { id: "RES-004", name: "Company Vehicle 1", type: "Vehicle", capacity: 6, location: "Parking B2", status: "Available" },
];

export const maintenanceTasks: MaintenanceTask[] = [
  { id: "MNT-001", assetId: "AST-004", assetName: "HP LaserJet Pro", issue: "Paper jam & roller replacement", priority: "High", technician: "Suresh Nair", status: "In Progress", createdAt: "2024-07-01T10:00:00Z", updatedAt: "2024-07-05T10:00:00Z", department: "Finance", description: "Frequent paper jams, roller worn out" },
  { id: "MNT-002", assetId: "AST-008", assetName: "Dell PowerEdge Server", issue: "Fan noise", priority: "Medium", technician: "—", status: "Pending", createdAt: "2024-07-06T10:00:00Z", updatedAt: "2024-07-06T10:00:00Z", department: "IT", description: "Loud fan noise from rack unit 4" },
];

export const notifications: Notification[] = [
  { id: "NOT-001", type: "alert", title: "Asset Overdue for Return", description: "Toyota Innova Crysta (AST-005) is overdue by 3 days.", timestamp: "2024-07-12T09:30:00Z", priority: "high", read: false, module: "Allocation" },
  { id: "NOT-002", type: "approval", title: "Transfer Request Pending", description: "Transfer of Dell Monitor (AST-002) needs your approval.", timestamp: "2024-07-12T08:15:00Z", priority: "high", read: false, module: "Transfer" },
  { id: "NOT-003", type: "maintenance", title: "Maintenance Approved", description: "MNT-002 has been approved and assigned.", timestamp: "2024-07-11T14:20:00Z", priority: "medium", read: true, module: "Maintenance" },
];
