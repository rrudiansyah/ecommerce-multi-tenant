import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { loginUser } from "../services/auth-service";

export const authRoute = new Elysia({ prefix: "/api" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "ecommerce_super_secret_key",
      exp: "7d", // token expires in 7 days
    })
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      try {
        const { user, sessionId, sessionToken } = await loginUser({
          email: body.email,
          password: body.password,
          tenantId: body.tenant_id,
        });

        // Generate JWT with user info and session token (JTI)
        const tokenJwt = await jwt.sign({
          sub: user.id.toString(),
          email: user.email,
          role: user.role,
          jti: sessionToken, // session identifier
        });

        return {
          data: tokenJwt,
        };
      } catch (error: any) {
        if (error.message === "email atau password salah") {
          set.status = 401;
          return { error: "email atau password salah" };
        }

        set.status = 500;
        return { error: "Terjadi kesalahan internal pada server" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
        tenant_id: t.Number(),
      }),
    }
  );
