import { Router, Request, Response } from "express";

const router = Router();

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  user: string;
  module: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
}

// In-memory activity log — appended to by other routes via addLog()
export const activityLogs: ActivityLog[] = [];

let logCounter = 1;

export function addLog(
  action: string,
  description: string,
  user: string,
  module: string,
  severity: "info" | "warning" | "error" = "info"
): void {
  activityLogs.unshift({
    id: `LOG-${String(logCounter++).padStart(4, "0")}`,
    action,
    description,
    user,
    module,
    severity,
    timestamp: new Date().toISOString(),
  });
  // Keep last 500 entries
  if (activityLogs.length > 500) activityLogs.pop();
}

// GET /api/activity — returns recent activity logs
router.get("/", (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const module = req.query.module as string | undefined;

  let result = module
    ? activityLogs.filter(l => l.module.toLowerCase() === module.toLowerCase())
    : activityLogs;

  result = result.slice(0, limit);

  res.json({ success: true, data: result, total: result.length });
});

export default router;
