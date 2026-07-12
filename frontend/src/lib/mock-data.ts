export type AssetStatus = "Available" | "Allocated" | "Under Maintenance" | "Retired" | "Pending Transfer";

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
}

export const mockAssets: Asset[] = [
  { id: "AST-001", name: "MacBook Pro 16\"", category: "Laptops", department: "Engineering", status: "Allocated", currentHolder: "Arjun Mehta", location: "Floor 3 - Bay 12", purchaseDate: "2024-01-15", vendor: "Apple India", cost: 285000, serialNumber: "SN-MBP-2024-001", warrantyExpiry: "2027-01-15", description: "M3 Pro chip, 36GB RAM" },
  { id: "AST-002", name: "Dell Monitor 27\"", category: "Monitors", department: "Design", status: "Available", currentHolder: "—", location: "IT Storeroom A", purchaseDate: "2023-11-20", vendor: "Dell Technologies", cost: 42000, serialNumber: "SN-DLM-2023-002", warrantyExpiry: "2026-11-20", description: "4K IPS Display" },
  { id: "AST-003", name: "Conference Projector", category: "AV Equipment", department: "Admin", status: "Available", currentHolder: "—", location: "Conference Room B", purchaseDate: "2023-06-10", vendor: "Epson India", cost: 68000, serialNumber: "SN-PRJ-2023-003", warrantyExpiry: "2026-06-10", description: "4K laser projector 5000 lumens" },
  { id: "AST-004", name: "HP LaserJet Pro", category: "Printers", department: "Finance", status: "Under Maintenance", currentHolder: "Finance Dept", location: "Floor 2 - Finance Bay", purchaseDate: "2022-03-05", vendor: "HP India", cost: 35000, serialNumber: "SN-HPP-2022-004", warrantyExpiry: "2025-03-05", description: "Color laser printer" },
  { id: "AST-005", name: "Toyota Innova Crysta", category: "Vehicles", department: "Operations", status: "Allocated", currentHolder: "Ravi Kumar", location: "Parking B2", purchaseDate: "2023-08-20", vendor: "Toyota Kirloskar", cost: 1850000, serialNumber: "MH02-AB-1234", warrantyExpiry: "2026-08-20", description: "Company vehicle for field ops" },
  { id: "AST-006", name: "iPhone 15 Pro", category: "Mobile Devices", department: "Sales", status: "Allocated", currentHolder: "Priya Sharma", location: "Sales Floor", purchaseDate: "2024-02-10", vendor: "Apple India", cost: 134900, serialNumber: "SN-IPH-2024-006", warrantyExpiry: "2026-02-10", description: "256GB Space Black" },
  { id: "AST-007", name: "Cisco IP Phone 8800", category: "Telecom", department: "HR", status: "Available", currentHolder: "—", location: "IT Storeroom A", purchaseDate: "2023-01-15", vendor: "Cisco Systems", cost: 22000, serialNumber: "SN-CSC-2023-007", warrantyExpiry: "2026-01-15", description: "VoIP desk phone" },
  { id: "AST-008", name: "Server Dell PowerEdge", category: "Servers", department: "IT", status: "Allocated", currentHolder: "IT Dept", location: "Server Room", purchaseDate: "2023-04-01", vendor: "Dell Technologies", cost: 980000, serialNumber: "SN-SRV-2023-008", warrantyExpiry: "2028-04-01", description: "R740 16-core 128GB RAM" },
  { id: "AST-009", name: "Ergonomic Chair Steelcase", category: "Furniture", department: "Engineering", status: "Allocated", currentHolder: "Neha Verma", location: "Floor 3 - Bay 5", purchaseDate: "2024-03-20", vendor: "Steelcase India", cost: 45000, serialNumber: "SN-CHR-2024-009", warrantyExpiry: "2034-03-20", description: "Leap V2 ergonomic chair" },
  { id: "AST-010", name: "iPad Pro 12.9\"", category: "Tablets", department: "Design", status: "Available", currentHolder: "—", location: "IT Storeroom B", purchaseDate: "2024-01-05", vendor: "Apple India", cost: 112000, serialNumber: "SN-IPD-2024-010", warrantyExpiry: "2026-01-05", description: "M2 chip with Apple Pencil" },
  { id: "AST-011", name: "Standing Desk Flexispot", category: "Furniture", department: "HR", status: "Allocated", currentHolder: "Amit Singh", location: "Floor 1 - HR Bay", purchaseDate: "2023-09-15", vendor: "Flexispot India", cost: 28000, serialNumber: "SN-DSK-2023-011", warrantyExpiry: "2033-09-15", description: "Electric height-adjustable desk" },
  { id: "AST-012", name: "Forklift Hyster H50", category: "Heavy Machinery", department: "Warehouse", status: "Under Maintenance", currentHolder: "Warehouse Dept", location: "Warehouse Level 1", purchaseDate: "2021-06-10", vendor: "Hyster-Yale", cost: 1250000, serialNumber: "SN-FKL-2021-012", warrantyExpiry: "2024-06-10", description: "5-ton capacity electric forklift" },
  { id: "AST-013", name: "Network Switch Cisco", category: "Networking", department: "IT", status: "Allocated", currentHolder: "IT Dept", location: "Server Room", purchaseDate: "2023-02-28", vendor: "Cisco Systems", cost: 185000, serialNumber: "SN-NSW-2023-013", warrantyExpiry: "2028-02-28", description: "48-port PoE Gigabit switch" },
  { id: "AST-014", name: "3D Printer Formlabs", category: "Lab Equipment", department: "R&D", status: "Available", currentHolder: "—", location: "R&D Lab", purchaseDate: "2024-04-01", vendor: "Formlabs", cost: 320000, serialNumber: "SN-3DP-2024-014", warrantyExpiry: "2027-04-01", description: "Form 4 resin 3D printer" },
  { id: "AST-015", name: "Sony 65\" BRAVIA", category: "Displays", department: "Admin", status: "Allocated", currentHolder: "Board Room", location: "Board Room", purchaseDate: "2023-11-05", vendor: "Sony India", cost: 175000, serialNumber: "SN-TV-2023-015", warrantyExpiry: "2026-11-05", description: "4K OLED commercial display" },
];

export const mockCategories = [
  { id: "CAT-001", name: "Laptops", prefix: "LAP", description: "Portable computers", status: "Active" },
  { id: "CAT-002", name: "Monitors", prefix: "MON", description: "Display screens", status: "Active" },
  { id: "CAT-003", name: "AV Equipment", prefix: "AVE", description: "Audio/Visual devices", status: "Active" },
  { id: "CAT-004", name: "Printers", prefix: "PRT", description: "Printing devices", status: "Active" },
  { id: "CAT-005", name: "Vehicles", prefix: "VEH", description: "Company vehicles", status: "Active" },
  { id: "CAT-006", name: "Mobile Devices", prefix: "MOB", description: "Smartphones and tablets", status: "Active" },
  { id: "CAT-007", name: "Furniture", prefix: "FRN", description: "Office furniture", status: "Active" },
  { id: "CAT-008", name: "Servers", prefix: "SRV", description: "Data center servers", status: "Active" },
  { id: "CAT-009", name: "Networking", prefix: "NET", description: "Network infrastructure", status: "Active" },
  { id: "CAT-010", name: "Lab Equipment", prefix: "LAB", description: "Research and lab tools", status: "Active" },
];

export const mockDepartments = [
  { id: "DEP-001", name: "Engineering", head: "Rajesh Gupta", parent: "Technology", status: "Active" },
  { id: "DEP-002", name: "Design", head: "Sunita Rao", parent: "Technology", status: "Active" },
  { id: "DEP-003", name: "Finance", head: "Vikram Patel", parent: "Operations", status: "Active" },
  { id: "DEP-004", name: "HR", head: "Meena Krishnan", parent: "Admin", status: "Active" },
  { id: "DEP-005", name: "Sales", head: "Aditya Sharma", parent: "Business", status: "Active" },
  { id: "DEP-006", name: "Operations", head: "Suresh Nair", parent: "Admin", status: "Active" },
  { id: "DEP-007", name: "IT", head: "Pranav Joshi", parent: "Technology", status: "Active" },
  { id: "DEP-008", name: "R&D", head: "Dr. Kavita Singh", parent: "Technology", status: "Active" },
  { id: "DEP-009", name: "Admin", head: "Ramesh Iyer", parent: "—", status: "Active" },
  { id: "DEP-010", name: "Warehouse", head: "Mahesh Tiwari", parent: "Operations", status: "Active" },
];

export const mockEmployees = [
  { id: "EMP-001", name: "Arjun Mehta", department: "Engineering", designation: "Senior Engineer", email: "arjun.mehta@assetflow.com", status: "Active" },
  { id: "EMP-002", name: "Priya Sharma", department: "Sales", designation: "Sales Manager", email: "priya.sharma@assetflow.com", status: "Active" },
  { id: "EMP-003", name: "Ravi Kumar", department: "Operations", designation: "Field Officer", email: "ravi.kumar@assetflow.com", status: "Active" },
  { id: "EMP-004", name: "Neha Verma", department: "Engineering", designation: "UX Designer", email: "neha.verma@assetflow.com", status: "Active" },
  { id: "EMP-005", name: "Amit Singh", department: "HR", designation: "HR Business Partner", email: "amit.singh@assetflow.com", status: "Active" },
  { id: "EMP-006", name: "Sunita Rao", department: "Design", designation: "Design Lead", email: "sunita.rao@assetflow.com", status: "Active" },
  { id: "EMP-007", name: "Vikram Patel", department: "Finance", designation: "CFO", email: "vikram.patel@assetflow.com", status: "Active" },
  { id: "EMP-008", name: "Meena Krishnan", department: "HR", designation: "HR Director", email: "meena.krishnan@assetflow.com", status: "Active" },
  { id: "EMP-009", name: "Pranav Joshi", department: "IT", designation: "IT Manager", email: "pranav.joshi@assetflow.com", status: "Active" },
  { id: "EMP-010", name: "Kavita Singh", department: "R&D", designation: "Research Lead", email: "kavita.singh@assetflow.com", status: "Active" },
];
