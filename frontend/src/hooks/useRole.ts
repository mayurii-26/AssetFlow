import { useAuth } from "@/context/AuthContext";

/** Normalise role strings from both backend formats */
function normalise(role?: string) {
  return (role ?? "").toLowerCase().replace(/_/g, "_");
}

export function useRole() {
  const { user } = useAuth();
  const role = normalise(user?.role);

  const isAdmin        = role === "admin";
  const isAssetManager = role === "asset_manager";
  const isDeptHead     = role === "department_head";
  const isEmployee     = role === "employee";

  /** Can fully manage the organisation setup (departments, categories, employees) */
  const canManageOrg = isAdmin;

  /** Can register, edit, delete assets */
  const canRegisterAssets = isAdmin || isAssetManager;

  /** Can approve allocation requests, transfer requests, maintenance status changes */
  const canApproveRequests = isAdmin || isAssetManager;

  /** Can approve allocation / transfer requests within their own department */
  const canApproveDeptRequests = isAdmin || isAssetManager || isDeptHead;

  /** Can create and close audit cycles */
  const canManageAudit = isAdmin || isAssetManager;

  /** Sees full org-wide analytics */
  const canViewFullReports = isAdmin || isAssetManager;

  /** Can book resources (all roles can) */
  const canBook = true;

  /** Can raise maintenance requests (all roles can) */
  const canRaiseMaintenance = true;

  return {
    role,
    user,
    isAdmin,
    isAssetManager,
    isDeptHead,
    isEmployee,
    canManageOrg,
    canRegisterAssets,
    canApproveRequests,
    canApproveDeptRequests,
    canManageAudit,
    canViewFullReports,
    canBook,
    canRaiseMaintenance,
  };
}
