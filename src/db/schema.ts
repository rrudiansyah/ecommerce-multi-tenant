import { mysqlTable, serial, varchar, timestamp, mysqlEnum, int, boolean, text, bigint } from "drizzle-orm/mysql-core";

export const tenants = mysqlTable("tenants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  businessType: mysqlEnum("business_type", ["coffee_shop", "fashion", "laundry", "restoran", "bakery"]).notNull(),
  domain: varchar("domain", { length: 100 }).unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  tenantId: bigint("tenant_id", { mode: "number", unsigned: true }).references(() => tenants.id, { onDelete: "cascade" }), // NULL for superadmin
  role: mysqlEnum("role", ["superadmin", "tenant_admin", "customer"]).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull().unique(),
  phone: varchar("phone", { length: 100 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "active", "rejected", "suspended"]).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(), // JWT ID (JTI)
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull(), // UUID for session tracking
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow().onUpdateNow(),
});
