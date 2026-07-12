import * as path from "path";
import * as dotenv from "dotenv";

// Load .env from backend root (one level up from prisma/)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Setting up AssetFlow database...");

  const count = await prisma.user.count();
  if (count === 0) {
    const hash = await bcrypt.hash("Admin@1234", 10);
    await prisma.user.create({
      data: {
        name: "System Admin",
        email: "admin@assetflow.com",
        passwordHash: hash,
        role: "ADMIN",
        organization: "My Organization",
      },
    });
    console.log("✓ Default admin account created");
    console.log("  Email:    admin@assetflow.com");
    console.log("  Password: Admin@1234");
    console.log("  ⚠️  Change this password after first login!\n");
  } else {
    console.log("ℹ️  Users already exist — skipping admin creation");
  }

  console.log("✅ Database ready.");
}

main()
  .catch(e => { console.error("❌ Setup failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
