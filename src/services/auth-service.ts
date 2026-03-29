import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const loginUser = async (payload: {
  email: string;
  password: string;
  tenant_id: number;
}) => {
  // 1. Find user by email and tenant_id
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.email, payload.email),
      eq(users.tenant_id, payload.tenant_id)
    ),
  });

  if (!user) {
    throw new Error("email atau password salah");
  }

  // 2. Verify password
  const isPasswordValid = await Bun.password.verify(payload.password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error("email atau password salah");
  }

  // 3. Create a new session with a single UUID for both ID and token
  const sessionId = crypto.randomUUID();

  await db.insert(sessions).values({
    id: sessionId,
    user_id: user.id,
    token: sessionId, // Using the same ID as token for simplicity
    is_active: true,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    sessionToken: sessionId,
    sessionId: sessionId,
  };
};
