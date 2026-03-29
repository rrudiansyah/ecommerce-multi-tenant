import { db } from "../src/db";
import { sql } from "drizzle-orm";

export async function clearDatabase() {
  // Use raw SQL to disable foreign key checks and clear tables
  // This ensures a clean state for every test scenario
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 0`);
  await db.execute(sql`DELETE FROM sessions`);
  await db.execute(sql`DELETE FROM users`);
  await db.execute(sql`DELETE FROM tenants`);
  await db.execute(sql`SET FOREIGN_KEY_CHECKS = 1`);
  
  // Reset auto-increment
  await db.execute(sql`ALTER TABLE tenants AUTO_INCREMENT = 1`);
  await db.execute(sql`ALTER TABLE users AUTO_INCREMENT = 1`);
}
