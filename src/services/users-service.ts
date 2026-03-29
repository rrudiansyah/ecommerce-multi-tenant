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
  console.log("Inserting user with tenantId:", payload.tenantId);
  await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    tenantId: payload.tenantId ?? null,
    passwordHash: passwordHash,
    status: "pending",
  });

  return "OK";
};

export const getCurrentUser = async (userId: number) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      tenantId: true,
      createdAt: true,
      status: true,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};
