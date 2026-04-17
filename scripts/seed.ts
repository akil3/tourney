/**
 * Seed script: creates a super admin user.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Or with custom values:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret123 ADMIN_NAME="Your Name" npx tsx scripts/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@tourney.local";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Super Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Promote to superadmin if they exist but aren't one
    if (existing.role !== "superadmin") {
      await prisma.user.update({
        where: { email },
        data: { role: "superadmin" },
      });
      console.log(`Promoted ${email} to superadmin`);
    } else {
      console.log(`Super admin ${email} already exists`);
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: "superadmin",
    },
  });

  console.log(`Created super admin:`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log(`  ID:       ${user.id}`);
  console.log(`\nChange the password after first login!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
