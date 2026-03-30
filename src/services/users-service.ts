import { db } from "../db";
import { users, sessions, tenants } from "../db/schema";
import { eq } from "drizzle-orm";

export const registerUser = async (payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: "superadmin" | "tenant_admin" | "customer";
  tenant_id?: number;
  business_name?: string;
  business_type?: "coffee_shop" | "fashion" | "laundry" | "restoran" | "bakery";
}) => {
  // 1. Check if email already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, payload.email),
  });

  if (existingUser) {
    throw new Error("user sudah terdaftar");
  }

  // 2. Hash password with bcrypt
  const password_hash = await Bun.password.hash(payload.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // 3. Handle Tenant creation if business info is provided
  let finalTenantId = payload.tenant_id;
  
  if (payload.business_name && payload.business_type) {
    const [result] = await db.insert(tenants).values({
      name: payload.business_name,
      business_type: payload.business_type,
    });
    finalTenantId = (result as any).insertId;
  }

  // 4. Insert user
  await db.insert(users).values({
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role || "tenant_admin",
    tenant_id: finalTenantId ?? null,
    password_hash: password_hash,
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
      tenant_id: true,
      created_at: true,
      status: true,
    },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const logoutUser = async (sessionToken: string) => {
  await db.delete(sessions).where(eq(sessions.token, sessionToken));
  return "OK";
};
