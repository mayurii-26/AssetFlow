import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, ".env") });

import { PrismaClient } from "./src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check existing users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, passwordHash: true }
  });
  console.log("Users in DB:", users.map(u => ({ id: u.id, email: u.email, role: u.role, hashPrefix: u.passwordHash?.substring(0, 20) })));

  // Reset admin password
  const newHash = await bcrypt.hash("Admin@1234", 10);
  
  const updated = await prisma.user.upsert({
    where: { email: "admin@assetflow.com" },
    update: { passwordHash: newHash },
    create: {
      name: "System Admin",
      email: "admin@assetflow.com",
      passwordHash: newHash,
      role: "ADMIN",
      organization: "My Organization",
    }
  });

  console.log("Admin user ready:", updated.email);

  // Verify the hash works
  const valid = await bcrypt.compare("Admin@1234", newHash);
  console.log("Hash verification:", valid ? "✅ OK" : "❌ FAIL");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
