import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/index";
import { clearDatabase } from "./setup";

describe("eCommerce Multi-Tenant API Tests", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("Tenant Management (POST /api/tenants)", () => {
    it("should successfully register a new tenant with valid payload", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Test Coffee Shop",
            business_type: "coffee_shop",
          }),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toBe("OK");
    });

    it("should fail validation if business_type is invalid", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Invalid Shop",
            business_type: "invalid_type",
          }),
        })
      );

      expect(res.status).toBe(422); // Unprocessable Content from Elysia validation
    });

    it("should fail if payload is empty", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
      );

      expect(res.status).toBe(422);
    });
  });

  describe("User Registration (POST /api/users)", () => {
    beforeEach(async () => {
        // Pre-create a tenant for user tests that require one
        await app.handle(
            new Request("http://localhost/api/tenants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: "Main Tenant", business_type: "fashion" }),
            })
        );
    });

    it("should register a tenant_admin successfully with existing tenant_id", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Admin User",
            email: "admin@test.com",
            phone: "0812345678",
            password: "password123",
            role: "tenant_admin",
            tenant_id: 1,
          }),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe("User created successfully");
    });

    it("should register a superadmin successfully without tenant_id", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Super Admin",
            email: "super@test.com",
            phone: "0812345679",
            password: "password123",
            role: "superadmin",
          }),
        })
      );

      expect(res.status).toBe(200);
    });

    it("should fail if email is already registered", async () => {
      // Register first user
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User 1",
            email: "dup@test.com",
            phone: "1",
            password: "password",
            role: "customer",
            tenant_id: 1,
          }),
        })
      );

      // Register second user with same email
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User 2",
            email: "dup@test.com",
            phone: "2",
            password: "password",
            role: "customer",
            tenant_id: 1,
          }),
        })
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("user sudah terdaftar");
    });

    it("should fail if name exceeds 100 characters (Validation Constraint)", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "a".repeat(101),
            email: "long@test.com",
            phone: "3",
            password: "password",
            role: "customer",
            tenant_id: 1,
          }),
        })
      );

      expect(res.status).toBe(422); // Should be 422 from Elysia validation
    });

    it("should fail if password is less than 6 characters", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "User",
            email: "short@test.com",
            phone: "4",
            password: "123",
            role: "customer",
            tenant_id: 1,
          }),
        })
      );

      expect(res.status).toBe(422);
    });
  });

  describe("Authentication & Session (POST /api/login, GET /api/users/current, DELETE /api/users/logout)", () => {
    let token = "";

    beforeEach(async () => {
      // Setup: Create tenant and user
      await app.handle(
        new Request("http://localhost/api/tenants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Auth Tenant", business_type: "bakery" }),
        })
      );
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Auth User",
            email: "auth@test.com",
            phone: "001",
            password: "password123",
            role: "tenant_admin",
            tenant_id: 1,
          }),
        })
      );
    });

    it("should successfully login and receive a JWT token", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "auth@test.com",
            password: "password123",
            tenant_id: 1,
          }),
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data).toBeDefined();
      token = data.data;
    });

    it("should fail login with wrong password", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "auth@test.com",
            password: "wrong_password",
            tenant_id: 1,
          }),
        })
      );

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("email atau password salah");
    });

    it("should allow accessing current profile with valid token", async () => {
      // 1. Login first to get fresh token
      const loginRes = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "auth@test.com",
            password: "password123",
            tenant_id: 1,
          }),
        })
      );
      const { data: loginToken } = await loginRes.json();

      // 2. Access profile
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${loginToken}`,
          },
        })
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.email).toBe("auth@test.com");
    });

    it("should deny access to profile without Authorization header", async () => {
      const res = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(res.status).toBe(401);
    });

    it("should successfully logout and invalidate the session", async () => {
      // 1. Login
      const loginRes = await app.handle(
        new Request("http://localhost/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "auth@test.com",
            password: "password123",
            tenant_id: 1,
          }),
        })
      );
      const { data: loginToken } = await loginRes.json();

      // 2. Logout
      const logoutRes = await app.handle(
        new Request("http://localhost/api/users/logout", {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${loginToken}`,
          },
        })
      );
      expect(logoutRes.status).toBe(200);
      const logoutData = await logoutRes.json();
      expect(logoutData.data).toBe("OK");

      // 3. Try to access profile with the SAME token
      const profileRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${loginToken}`,
          },
        })
      );
      // It should fail because the session is deleted from DB
      expect(profileRes.status).toBe(401);
    });
  });
});
