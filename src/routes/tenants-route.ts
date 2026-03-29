import { Elysia, t } from "elysia";
import { createTenant } from "../services/tenants-service";

export const tenantsRoute = new Elysia({ prefix: "/api" })
  .post(
    "/tenants",
    async ({ body, set }) => {
      try {
        const result = await createTenant({
          name: body.name,
          business_type: body.business_type,
          domain: body.domain,
        });
        
        return {
          data: result,
        };
      } catch (error: any) {
        set.status = 400;
        return {
          error: "error",
        };
      }
    },
    {
      body: t.Object({
        name: t.String(),
        business_type: t.Enum({
          coffee_shop: "coffee_shop",
          fashion: "fashion",
          laundry: "laundry",
          restoran: "restoran",
          bakery: "bakery",
        }),
        domain: t.Optional(t.String()),
        created_at: t.Optional(t.String()), // Allow but ignore as per issue.md
      }),
    }
  );
