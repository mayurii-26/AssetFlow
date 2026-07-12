import { Asset, Department, Employee, Category, Allocation, TransferRequest, Booking, Resource, MaintenanceTask, AuditItem, Notification } from "../types";

// All collections start empty — data is created by each organization at runtime.
export const assets: Asset[] = [];
export const departments: Department[] = [];
export const employees: Employee[] = [];
export const categories: Category[] = [];
export const resources: Resource[] = [];
export const maintenanceTasks: MaintenanceTask[] = [];
export const notifications: Notification[] = [];
