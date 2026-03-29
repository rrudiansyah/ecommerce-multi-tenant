const baseUrl = "http://localhost:3000/api";
const longName = "a".repeat(300);

async function runTest() {
  console.log("Registering user with name length:", longName.length);
  const registerRes = await fetch(`${baseUrl}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: longName,
      email: "longname@test.com",
      phone: "0001",
      password: "password",
      role: "tenant_admin",
      tenant_id: 1,
    }),
  });
  
  const text = await registerRes.text();
  console.log("Status:", registerRes.status);
  console.log("Response:", text);
}
runTest();
