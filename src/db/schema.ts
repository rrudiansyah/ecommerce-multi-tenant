import { mysqlTable, serial, varchar, timestamp, mysqlEnum, int, boolean, text } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  tenantId: int("tenant_id"), // NULL for superadmin
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
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull(), // UUID for session tracking
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").defaultNow().onUpdateNow(),
});
