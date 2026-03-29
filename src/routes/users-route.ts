import { Elysia, t } from "elysia";
import { registerUser } from "../services/users-service";

export const usersRoute = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      const result = await registerUser(body);
      
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
  });
