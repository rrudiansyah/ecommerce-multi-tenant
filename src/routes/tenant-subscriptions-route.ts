import { Elysia, t } from "elysia";
import { createSubscription } from "../services/tenant-subscriptions-service";

export const tenantSubscriptionsRoute = new Elysia({ prefix: "/api/tenant_subscriptions" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await createSubscription({
          tenant_id: body.tenant_id,
          package_id: body.package_id,
          start_date: body.start_date,
          end_date: body.end_date,
        });

        return { data: result };
      } catch (error: any) {
        set.status = 500;
        return { error: error.message };
      }
    },
    {
      body: t.Object({
        tenant_id: t.Number(),
        package_id: t.Number(),
        start_date: t.String(), // String in format YYYY-MM-DD HH:MM:SS
        end_date: t.String(),   // String in format YYYY-MM-DD HH:MM:SS
      }),
    }
  );
