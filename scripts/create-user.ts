import "../lib/env";

import bcrypt from "bcryptjs";
import { db } from "../lib/db";
import { users } from "../lib/schema";

async function main() {
  const username = "admin";
  const password = "123456";

  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    username,
    passwordHash,
  });

  console.log("Usuario creado correctamente");

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});