import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { registerUser, getCurrentUser } from "../services/users-service";
import { db } from "../db";
import { sessions } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const usersRoute = new Elysia({ prefix: "/api" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "ecommerce_super_secret_key",
    })
  )
  .post("/users", async ({ body, set }) => {
    console.log("Registration Body:", JSON.stringify(body));
    try {
      const result = await registerUser({
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        role: body.role,
        tenantId: body.tenant_id,
      });
      
      return {
        message: "User created successfully",
        data: result,
      };
    } catch (error: any) {
      if (error.message === "user sudah terdaftar") {
        set.status = 400;
        return { error: "user sudah terdaftar" };
      }
      
      set.status = 500;
      return { error: "Terjadi kesalahan internal pada server" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: "email" }),
      phone: t.String(),
      password: t.String(),
      role: t.Enum({
        superadmin: "superadmin",
        tenant_admin: "tenant_admin",
        customer: "customer",
      }),
      tenant_id: t.Optional(t.Number()),
    }),
  })
  .get("/users/current", async ({ jwt, headers, set }) => {
    const authHeader = headers['authorization'];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const token = authHeader.substring(7);
    const payload = await jwt.verify(token);

    if (!payload || !payload.sub || !payload.jti) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    // Verify session in database (jti must match session token and must be active)
    const sessionToken = payload.jti as string;
    const session = await db.query.sessions.findFirst({
      where: and(
        eq(sessions.token, sessionToken),
        eq(sessions.isActive, true)
      ),
    });

    if (!session) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    try {
      const user = await getCurrentUser(Number(payload.sub));
      return {
        data: user,
      };
    } catch (error) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
  });
