import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const registerUser = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "superadmin" | "tenant_admin" | "customer";
  tenantId?: number;
}) => {
  // 1. Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (existingUser) {
    throw new Error("user sudah terdaftar");
  }

  // 2. Hash password with bcrypt
  const passwordHash = await Bun.password.hash(payload.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // 3. Insert user
  await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    tenantId: payload.tenantId || null,
    passwordHash: passwordHash,
    status: "pending",
  });

  return "OK";
};
