/**
 * scripts/test-api.js
 * Quick smoke-test for the HumiGrow backend.
 * Run: node scripts/test-api.js
 */

const BASE = `http://localhost:${process.env.PORT || 3000}`;

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  return { status: res.status, body: json };
}

async function run() {
  console.log("🧪 HumiGrow API smoke-test\n");

  // 1. Health
  let r = await req("GET", "/health");
  console.log("GET /health →", r.status, r.body.status === "ok" ? "✅" : "❌");

  // 2. Create
  r = await req("POST", "/humigrow/measurement/create", {
    device_id: "test-esp-01",
    location: "sklenik",
    temperature_c: 23.4,
    humidity_pct: 61.2,
    battery_pct: 88.0,
    wifi_rssi: -55,
    uptime_s: 1200,
  });
  console.log("POST /humigrow/measurement/create →", r.status, r.status === 200 ? "✅" : "❌");
  const id = r.body.measurement?.id;
  if (!id) { console.error("No id returned — aborting"); process.exit(1); }
  console.log("  Created id:", id);

  // 3. Get
  r = await req("GET", `/humigrow/measurement/get?id=${id}`);
  console.log("GET /humigrow/measurement/get →", r.status, r.status === 200 ? "✅" : "❌");

  // 4. List
  r = await req("GET", "/humigrow/measurement/list?pageSize=5");
  console.log("GET /humigrow/measurement/list →", r.status, r.status === 200 ? "✅" : "❌");
  console.log("  Total records:", r.body.pageInfo?.total);

  // 5. Archive
  r = await req("POST", "/humigrow/measurement/archive", { id });
  console.log("POST /humigrow/measurement/archive →", r.status, r.status === 200 ? "✅" : "❌");

  // 6. Validation error
  r = await req("POST", "/humigrow/measurement/create", { device_id: "x" });
  console.log("POST (bad dtoIn) →", r.status, r.status === 400 ? "✅" : "❌");

  console.log("\nDone.");
}

run().catch((err) => { console.error("Test failed:", err.message); process.exit(1); });
