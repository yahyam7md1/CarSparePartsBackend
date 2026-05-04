import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(rootDir, ".env") });

const prisma = new PrismaClient();

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
const rounds = Number(process.env.BCRYPT_ROUNDS);
const bcryptRounds =
  Number.isFinite(rounds) && rounds >= 10 && rounds <= 16 ? rounds : 12;

async function main() {
  if (!username?.trim() || !password?.trim()) {
    throw new Error(
      "Set ADMIN_USERNAME and ADMIN_PASSWORD in .env (project root) before running the seed.",
    );
  }

  const passwordHash = await bcrypt.hash(password.trim(), bcryptRounds);

  await prisma.admin.upsert({
    where: { username: username.trim() },
    update: { passwordHash },
    create: { username: username.trim(), passwordHash },
  });
}

try {
  await main();
  console.log("Seed finished: admin upserted.");
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
