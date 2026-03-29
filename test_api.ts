const baseUrl = "http://localhost:3000/api";

async function runTest() {
  console.log("--- STARTING API VERIFICATION ---");

  // 1. Register User
  console.log("1. Registering user...");
  const registerRes = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Eko Test",
      email: "eko@test.com",
      phone: "0812345",
      password: "password123",
      role: "tenant_admin",
      tenant_id: 1,
    }),
  });
  const registerData = await registerRes.json();
  console.log("Register Response:", JSON.stringify(registerData));

  // 2. Login
  console.log("2. Logging in...");
  const loginRes = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "eko@test.com",
      password: "password123",
      tenant_id: 1,
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login Response:", JSON.stringify(loginData));

  if (!loginData.data) {
    console.error("Login failed, no token received.");
    return;
  }
  const token = loginData.data;

  // 3. Get Current User
  console.log("3. Fetching current user profile...");
  const profileRes = await fetch(`${baseUrl}/users/current`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const profileData = await profileRes.json();
  console.log("Profile Response:", JSON.stringify(profileData));

  console.log("--- API VERIFICATION COMPLETE ---");
}

runTest().catch(console.error);
