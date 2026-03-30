import { Elysia, t } from "elysia";
import { createPackage } from "../services/packages-service";

export const packagesRoute = new Elysia({ prefix: "/api/packages" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await createPackage({
          name: body.name,
          duration_days: body.duration_days,
          max_users: body.max_users,
          max_products: body.max_products,
        });

        return { data: result };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        duration_days: t.Number(),
        max_users: t.Optional(t.Number()),
        max_products: t.Optional(t.Number()),
      }),
    }
  );
