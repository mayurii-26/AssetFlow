import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import authRouter from "./routes/auth";
import assetsRouter from "./routes/assets";
import organizationRouter from "./routes/organization";
import allocationRouter from "./routes/allocation";
import bookingRouter from "./routes/booking";
import maintenanceRouter from "./routes/maintenance";
import auditRouter from "./routes/audit";
import notificationsRouter from "./routes/notifications";
import reportsRouter from "./routes/reports";
import activityRouter from "./routes/activity";
import blockchainRouter from "./routes/blockchain";
import { initializeWeb3 } from "./blockchain/config/init";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// Strip trailing slash from FRONTEND_URL to match browser origin exactly
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");

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

// ── Auth routes (public) ────────────────────────────────
app.use("/api/auth", authRouter);

// ── Protected API Routes ────────────────────────────────
app.use("/api/assets",        assetsRouter);
app.use("/api/organization",  organizationRouter);
app.use("/api/allocation",    allocationRouter);
app.use("/api/booking",       bookingRouter);
app.use("/api/maintenance",   maintenanceRouter);
app.use("/api/audit",         auditRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reports",       reportsRouter);
app.use("/api/activity",      activityRouter);
app.use("/api/blockchain",    blockchainRouter);

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
  console.log(`\n🚀  AssetFlow API  →  http://localhost:${PORT}`);
  console.log(`    Health check  →  http://localhost:${PORT}/health`);
  console.log(`    CORS allowed  →  ${FRONTEND_URL}`);
  console.log(`\n    Demo accounts:`);
  console.log(`    Admin     →  admin@assetflow.com  /  password123`);
  console.log(`    Employee  →  user@assetflow.com   /  password123\n`);

  // ── Blockchain: attempt Web3 connection (non-blocking) ─────────────────────
  // The ERP works fully without a running Hardhat node.
  // Start the node with: npm run blockchain:node
  initializeWeb3().then((ready) => {
    if (ready) {
      console.log(`    ⛓   Blockchain    →  connected (Hardhat local)\n`);
    } else {
      console.log(`    ⛓   Blockchain    →  offline (run: npm run blockchain:node)\n`);
    }
  });
});

export default app;
