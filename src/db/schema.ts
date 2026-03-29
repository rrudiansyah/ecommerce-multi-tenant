import { mysqlTable, serial, varchar, timestamp, mysqlEnum, int, boolean, text, bigint } from "drizzle-orm/mysql-core";

export const tenants = mysqlTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  business_type: mysqlEnum("business_type", ["coffee_shop", "fashion", "laundry", "restoran", "bakery"]).notNull(),
  domain: varchar("domain", { length: 100 }).unique(),
  created_at: timestamp("created_at").defaultNow(),
});

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  tenant_id: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id, { onDelete: "cascade" }), // NULL for superadmin
  role: mysqlEnum("role", ["superadmin", "tenant_admin", "customer"]).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 100 }).notNull(),
  password_hash: varchar("password_hash", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "active", "rejected", "suspended"]).default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(), // JWT ID (JTI)
  user_id: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull(), // UUID for session tracking
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
  is_active: boolean("is_active").default(true),
  last_activity: timestamp("last_activity").defaultNow().onUpdateNow(),
});
