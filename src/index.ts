import "dotenv/config";
import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";
import { authRoute } from "./routes/auth-route";
import { tenantsRoute } from "./routes/tenants-route";
import { packagesRoute } from "./routes/packages-route";

export const app = new Elysia()
  .use(usersRoute)
  .use(authRoute)
  .use(tenantsRoute)
  .use(packagesRoute)
  .get("/", () => "Hello, world! eCommerce Multi-Tenant is running.");

if (import.meta.main) {
  app.listen(3000);
  console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
}

export type App = typeof app;
