import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";
import { authRoute } from "./routes/auth-route";

const app = new Elysia()
  .use(usersRoute)
  .use(authRoute)
  .get("/", () => "Hello, world! eCommerce Multi-Tenant is running.")
  .listen(3000);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
