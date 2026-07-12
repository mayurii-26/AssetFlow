export const mockAllocations = [
  { id: "ALO-001", assetId: "AST-001", assetName: "MacBook Pro 16\"", fromEmployee: "IT Dept", toEmployee: "Arjun Mehta", department: "Engineering", date: "2024-01-20", reason: "New joiner allocation", status: "Active", notes: "Issued with charger and sleeve" },
  { id: "ALO-002", assetId: "AST-006", assetName: "iPhone 15 Pro", fromEmployee: "IT Dept", toEmployee: "Priya Sharma", department: "Sales", date: "2024-02-15", reason: "Role requirement", status: "Active", notes: "SIM card activated" },
  { id: "ALO-003", assetId: "AST-005", assetName: "Toyota Innova Crysta", fromEmployee: "Operations", toEmployee: "Ravi Kumar", department: "Operations", date: "2024-01-01", reason: "Field operations", status: "Active", notes: "Monthly fuel card attached" },
];

export const mockTransferRequests = [
  { id: "TRF-001", assetId: "AST-002", assetName: "Dell Monitor 27\"", fromEmployee: "Neha Verma", toEmployee: "Sunita Rao", department: "Design", reason: "Project reassignment", priority: "High", status: "Pending", createdAt: "2024-07-01", notes: "Urgent — design sprint starting" },
  { id: "TRF-002", assetId: "AST-007", assetName: "Cisco IP Phone", fromEmployee: "Amit Singh", toEmployee: "Meena Krishnan", department: "HR", reason: "Office relocation", priority: "Normal", status: "Approved", createdAt: "2024-06-28", notes: "" },
  { id: "TRF-003", assetId: "AST-010", assetName: "iPad Pro 12.9\"", fromEmployee: "IT Dept", toEmployee: "Kavita Singh", department: "R&D", reason: "Research project", priority: "Low", status: "Pending", createdAt: "2024-07-03", notes: "Needs MDM enrollment" },
];

export const mockBookings = [
  { id: "BOK-001", resourceId: "RES-001", resourceName: "Conference Room A", bookedBy: "Arjun Mehta", department: "Engineering", purpose: "Sprint Planning", startTime: "2024-07-15T09:00:00", endTime: "2024-07-15T11:00:00", attendees: 8, status: "Confirmed", notes: "" },
  { id: "BOK-002", resourceId: "RES-002", resourceName: "Projector Unit 1", bookedBy: "Priya Sharma", department: "Sales", purpose: "Client Presentation", startTime: "2024-07-15T14:00:00", endTime: "2024-07-15T15:30:00", attendees: 5, status: "Confirmed", notes: "Needs HDMI adapter" },
  { id: "BOK-003", resourceId: "RES-003", resourceName: "Conference Room B", bookedBy: "Vikram Patel", department: "Finance", purpose: "Board Meeting", startTime: "2024-07-16T10:00:00", endTime: "2024-07-16T12:00:00", attendees: 12, status: "Pending", notes: "" },
  { id: "BOK-004", resourceId: "RES-004", resourceName: "Company Vehicle 1", bookedBy: "Ravi Kumar", department: "Operations", purpose: "Client Visit — Pune", startTime: "2024-07-17T08:00:00", endTime: "2024-07-17T20:00:00", attendees: 3, status: "Confirmed", notes: "Driver needed" },
];

export const mockResources = [
  { id: "RES-001", name: "Conference Room A", type: "Meeting Room", capacity: 12, location: "Floor 2", status: "Available" },
  { id: "RES-002", name: "Projector Unit 1", type: "AV Equipment", capacity: 1, location: "IT Storeroom", status: "Available" },
  { id: "RES-003", name: "Conference Room B", type: "Meeting Room", capacity: 20, location: "Floor 1", status: "Available" },
  { id: "RES-004", name: "Company Vehicle 1", type: "Vehicle", capacity: 6, location: "Parking B2", status: "Available" },
  { id: "RES-005", name: "R&D Lab", type: "Lab Space", capacity: 8, location: "Floor 4", status: "Available" },
  { id: "RES-006", name: "Training Room", type: "Meeting Room", capacity: 30, location: "Floor 1", status: "Available" },
];

export const mockMaintenanceTasks = [
  { id: "MNT-001", assetId: "AST-004", assetName: "HP LaserJet Pro", issue: "Paper jam & roller replacement", priority: "High", technician: "Suresh Nair", status: "In Progress", createdAt: "2024-07-01", updatedAt: "2024-07-05", department: "Finance", description: "Frequent paper jams, roller worn out" },
  { id: "MNT-002", assetId: "AST-012", assetName: "Forklift Hyster H50", issue: "Battery replacement required", priority: "Critical", technician: "Mahesh Tiwari", status: "Approved", createdAt: "2024-06-28", updatedAt: "2024-07-03", department: "Warehouse", description: "Battery not holding charge, needs full replacement" },
  { id: "MNT-003", assetId: "AST-008", assetName: "Dell PowerEdge Server", issue: "Fan noise — possible bearing failure", priority: "Medium", technician: "Pranav Joshi", status: "Pending", createdAt: "2024-07-06", updatedAt: "2024-07-06", department: "IT", description: "Loud fan noise from rack unit 4" },
  { id: "MNT-004", assetId: "AST-003", assetName: "Conference Projector", issue: "Lamp replacement", priority: "Low", technician: "—", status: "Pending", createdAt: "2024-07-07", updatedAt: "2024-07-07", department: "Admin", description: "Lamp hours exceeded 3000h, replacement needed" },
  { id: "MNT-005", assetId: "AST-013", assetName: "Cisco Network Switch", issue: "Port 12 not responding", priority: "High", technician: "Pranav Joshi", status: "Resolved", createdAt: "2024-06-20", updatedAt: "2024-06-25", department: "IT", description: "Physical port damage, replaced SFP module" },
];

export const mockAuditItems = [
  { id: "AUD-001", assetId: "AST-001", assetName: "MacBook Pro 16\"", expectedLocation: "Floor 3 - Bay 12", actualLocation: "Floor 3 - Bay 12", condition: "Good", status: "Verified", verifiedBy: "Pranav Joshi", verifiedAt: "2024-07-10" },
  { id: "AUD-002", assetId: "AST-002", assetName: "Dell Monitor 27\"", expectedLocation: "IT Storeroom A", actualLocation: "IT Storeroom A", condition: "Good", status: "Verified", verifiedBy: "Pranav Joshi", verifiedAt: "2024-07-10" },
  { id: "AUD-003", assetId: "AST-003", assetName: "Conference Projector", expectedLocation: "Conference Room B", actualLocation: "Conference Room A", condition: "Good", status: "Discrepancy", verifiedBy: "Ramesh Iyer", verifiedAt: "2024-07-10" },
  { id: "AUD-004", assetId: "AST-005", assetName: "Toyota Innova Crysta", expectedLocation: "Parking B2", actualLocation: "Parking B2", condition: "Good", status: "Verified", verifiedBy: "Suresh Nair", verifiedAt: "2024-07-10" },
  { id: "AUD-005", assetId: "AST-006", assetName: "iPhone 15 Pro", expectedLocation: "Sales Floor", actualLocation: "—", condition: "—", status: "Missing", verifiedBy: "—", verifiedAt: "—" },
  { id: "AUD-006", assetId: "AST-012", assetName: "Forklift Hyster H50", expectedLocation: "Warehouse Level 1", actualLocation: "Warehouse Level 1", condition: "Damaged", status: "Damaged", verifiedBy: "Mahesh Tiwari", verifiedAt: "2024-07-10" },
];

export const mockNotifications = [
  { id: "NOT-001", type: "alert", title: "Asset Overdue for Return", description: "Toyota Innova Crysta (AST-005) is overdue by 3 days. Allocated to Ravi Kumar.", timestamp: "2024-07-12T09:30:00", priority: "high", read: false, module: "Allocation" },
  { id: "NOT-002", type: "approval", title: "Transfer Request Pending", description: "Transfer of Dell Monitor (AST-002) from Neha Verma to Sunita Rao needs your approval.", timestamp: "2024-07-12T08:15:00", priority: "high", read: false, module: "Transfer" },
  { id: "NOT-003", type: "maintenance", title: "Maintenance Approved", description: "Forklift Hyster H50 maintenance request MNT-002 has been approved and assigned to Mahesh Tiwari.", timestamp: "2024-07-11T14:20:00", priority: "medium", read: true, module: "Maintenance" },
  { id: "NOT-004", type: "booking", title: "Booking Confirmed", description: "Conference Room A has been booked for Sprint Planning on July 15, 9:00 AM–11:00 AM.", timestamp: "2024-07-11T10:00:00", priority: "low", read: true, module: "Booking" },
  { id: "NOT-005", type: "audit", title: "Audit Discrepancy Found", description: "Conference Projector (AST-003) found at wrong location during audit cycle AUD-2024-Q3.", timestamp: "2024-07-10T16:45:00", priority: "high", read: false, module: "Audit" },
  { id: "NOT-006", type: "alert", title: "Warranty Expiring Soon", description: "HP LaserJet Pro (AST-004) warranty expires in 7 days (2025-03-05).", timestamp: "2024-07-10T09:00:00", priority: "medium", read: true, module: "Assets" },
  { id: "NOT-007", type: "approval", title: "New Asset Registration", description: "14 assets registered by Pranav Joshi pending admin review.", timestamp: "2024-07-09T11:30:00", priority: "medium", read: true, module: "Assets" },
  { id: "NOT-008", type: "maintenance", title: "Maintenance Resolved", description: "Cisco Network Switch port issue (MNT-005) has been marked resolved by Pranav Joshi.", timestamp: "2024-06-25T17:00:00", priority: "low", read: true, module: "Maintenance" },
];

export const mockActivityLogs = [
  { id: "LOG-001", action: "Asset Allocated", description: "MacBook Pro 16\" allocated to Arjun Mehta", user: "Pranav Joshi", module: "Allocation", severity: "info", timestamp: "2024-07-12T09:45:00" },
  { id: "LOG-002", action: "Transfer Requested", description: "Transfer request raised for Dell Monitor 27\"", user: "Neha Verma", module: "Transfer", severity: "info", timestamp: "2024-07-12T09:30:00" },
  { id: "LOG-003", action: "Booking Confirmed", description: "Conference Room A booked for Sprint Planning", user: "Arjun Mehta", module: "Booking", severity: "info", timestamp: "2024-07-12T09:00:00" },
  { id: "LOG-004", action: "Maintenance Raised", description: "Maintenance request MNT-003 raised for Dell PowerEdge", user: "Pranav Joshi", module: "Maintenance", severity: "warning", timestamp: "2024-07-11T15:30:00" },
  { id: "LOG-005", action: "Asset Retired", description: "Old HP Scanner (AST-016) retired from service", user: "Pranav Joshi", module: "Assets", severity: "info", timestamp: "2024-07-11T14:00:00" },
  { id: "LOG-006", action: "Audit Discrepancy", description: "Conference Projector found at wrong location", user: "Ramesh Iyer", module: "Audit", severity: "error", timestamp: "2024-07-10T16:45:00" },
  { id: "LOG-007", action: "Asset Missing", description: "iPhone 15 Pro could not be located during audit", user: "System", module: "Audit", severity: "error", timestamp: "2024-07-10T16:30:00" },
  { id: "LOG-008", action: "User Login", description: "Admin login from 192.168.1.45", user: "Vikram Patel", module: "System", severity: "info", timestamp: "2024-07-10T09:00:00" },
];
