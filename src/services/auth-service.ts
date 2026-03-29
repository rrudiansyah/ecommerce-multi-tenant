import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const loginUser = async (payload: {
  email: string;
  password: string;
  tenantId: number;
}) => {
  // 1. Find user by email and tenantId
  const user = await db.query.users.findFirst({
    where: and(
      eq(users.email, payload.email),
      eq(users.tenantId, payload.tenantId)
    ),
  });

  if (!user) {
    throw new Error("email atau password salah");
  }

  // 2. Verify password
  const isPasswordValid = await Bun.password.verify(payload.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("email atau password salah");
  }

  // 3. Create a new session with UUID token
  const sessionToken = crypto.randomUUID();
  const sessionId = crypto.randomUUID(); // JTI for JWT

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    token: sessionToken,
    isActive: true,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    sessionToken: sessionToken,
    sessionId: sessionId,
  };
};
