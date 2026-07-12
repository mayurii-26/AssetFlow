import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import assetsRouter from "./routes/assets";
import organizationRouter from "./routes/organization";
import allocationRouter from "./routes/allocation";
import bookingRouter from "./routes/booking";
import maintenanceRouter from "./routes/maintenance";
import auditRouter from "./routes/audit";
import notificationsRouter from "./routes/notifications";
import reportsRouter from "./routes/reports";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), service: "AssetFlow API" });
});

// ── API Routes ──────────────────────────────────────────
app.use("/api/assets", assetsRouter);
app.use("/api/organization", organizationRouter);
app.use("/api/allocation", allocationRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/audit", auditRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reports", reportsRouter);

// ── 404 handler ─────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ── Global error handler ────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Error]", err.message);
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Start ───────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AssetFlow API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   CORS:   ${FRONTEND_URL}\n`);
});

export default app;
