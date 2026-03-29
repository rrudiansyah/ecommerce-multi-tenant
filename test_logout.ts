const baseUrl = "http://localhost:3000/api";

async function runTest() {
  console.log("--- STARTING LOGOUT API VERIFICATION ---");

  // 1. Ensure Tenant exists
  console.log("1. Creating tenant...");
  await fetch(`${baseUrl}/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Logout Test Shop", business_type: "coffee_shop" }),
  }).catch(() => {});

  // 2. Register User
  console.log("2. Registering user...");
  const registerRes = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Logout User",
      email: "logout@test.com",
      phone: "0001",
      password: "password",
      role: "tenant_admin",
      tenant_id: 1,
    }),
  });
  console.log("Register Response Status:", registerRes.status);

  // 3. Login
  console.log("3. Logging in...");
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "logout@test.com",
      password: "password",
      tenant_id: 1,
    }),
  });
  const loginData: any = await loginRes.json();
  const token = loginData.data;
  console.log("Login Token Received:", token ? "Yes" : "No");

  if (!token) {
    console.error("Login failed:", JSON.stringify(loginData));
    return;
  }

  // 4. Logout
  console.log("4. Logging out...");
  const logoutRes = await fetch(`${baseUrl}/users/logout`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const logoutData = await logoutRes.json();
  console.log("Logout Response:", JSON.stringify(logoutData));

  if (logoutData.data === "OK") {
    console.log("SUCCESS: Logout API responded OK.");
  } else {
    console.error("FAILURE: Logout API failed.", JSON.stringify(logoutData));
  }

  console.log("--- LOGOUT API VERIFICATION COMPLETE ---");
}

runTest().catch(console.error);
