/**
 * Blockchain Event Types
 * 
 * Defines all possible blockchain events that can be recorded
 * in the AssetFlow immutable audit trail.
 */
export enum BLOCKCHAIN_EVENTS {
  /** Asset registered in the system */
  ASSET_CREATED = 'ASSET_CREATED',
  
  /** Asset allocated to an employee or department */
  ASSET_ALLOCATED = 'ASSET_ALLOCATED',
  
  /** Asset transferred between employees/departments */
  ASSET_TRANSFERRED = 'ASSET_TRANSFERRED',
  
  /** Asset returned to inventory */
  ASSET_RETURNED = 'ASSET_RETURNED',
  
  /** Maintenance request initiated */
  MAINTENANCE_REQUESTED = 'MAINTENANCE_REQUESTED',
  
  /** Maintenance work completed */
  MAINTENANCE_COMPLETED = 'MAINTENANCE_COMPLETED',
  
  /** Audit process completed */
  AUDIT_COMPLETED = 'AUDIT_COMPLETED',
  
  /** Document verification completed */
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  
  /** Asset permanently disposed/retired */
  ASSET_DISPOSED = 'ASSET_DISPOSED',
}
