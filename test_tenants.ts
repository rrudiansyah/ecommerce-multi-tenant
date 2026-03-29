const baseUrl = "http://localhost:3000/api";

async function runTest() {
  console.log("--- STARTING TENANT API VERIFICATION ---");

  // 1. Create Tenant
  console.log("1. Creating tenant...");
  const res = await fetch(`${baseUrl}/tenants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "eko_coffee_shop",
      business_type: "coffee_shop",
    }),
  });
  const data = await res.json();
  console.log("Response:", JSON.stringify(data));

  if (data.data === "OK") {
    console.log("SUCCESS: Tenant created.");
  } else {
    console.error("FAILURE: Tenant not created.", JSON.stringify(data));
  }

  console.log("--- TENANT API VERIFICATION COMPLETE ---");
}

runTest().catch(console.error);
