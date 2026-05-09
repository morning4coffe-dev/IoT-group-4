/**
 * MQTT Listener
 * Subscribes to the Gateway (Raspberry Pi) MQTT broker and automatically
 * inserts incoming sensor readings into Supabase.
 *
 * IoT Node publishes to topic:  humigrow/measurements
 * Payload shape (from firmware):
 * {
 *   "device_id": "sklenik-esp-01",
 *   "location": "sklenik",
 *   "temperature_c": 24.5,
 *   "humidity_pct": 62.3,
 *   "battery_pct": 87.4,   // optional
 *   "wifi_rssi": -45,       // optional
 *   "uptime_s": 3600        // optional
 * }
 */
const mqtt = require("mqtt");
const measurementDao = require("../dao/measurementDao");

let client = null;

function startMqttListener() {
  const brokerUrl = process.env.MQTT_BROKER_URL;

  // Skip silently if MQTT is not configured (e.g. during local dev without Pi)
  if (!brokerUrl) {
    console.warn("⚠️  MQTT_BROKER_URL not set — MQTT listener disabled.");
    return;
  }

  const topic = process.env.MQTT_TOPIC || "humigrow/measurements";

  const options = {
    port: parseInt(process.env.MQTT_PORT || "1883", 10),
    clientId: `humigrow-backend-${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 10_000,
  };

  if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
  if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

  console.log(`🔌 Connecting to MQTT broker: ${brokerUrl} (topic: ${topic})`);
  client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    console.log("✅ MQTT connected");
    client.subscribe(topic, { qos: 1 }, (err) => {
      if (err) console.error("MQTT subscribe error:", err.message);
      else console.log(`📡 Subscribed to MQTT topic: ${topic}`);
    });
  });

  client.on("message", async (receivedTopic, messageBuffer) => {
    let payload;
    try {
      payload = JSON.parse(messageBuffer.toString());
    } catch {
      console.warn(`[MQTT] Invalid JSON on topic ${receivedTopic}:`, messageBuffer.toString());
      return;
    }

    // Basic validation — skip malformed messages
    if (!payload.device_id || !payload.location ||
        payload.temperature_c == null || payload.humidity_pct == null) {
      console.warn("[MQTT] Skipping incomplete payload:", payload);
      return;
    }

    // Skip NaN / out-of-range readings (matches firmware's DHT22 NaN check)
    if (!isFinite(payload.temperature_c) || !isFinite(payload.humidity_pct)) {
      console.warn("[MQTT] Skipping NaN sensor reading:", payload);
      return;
    }

    try {
      const record = {
        device:        payload.device_id,
        location:      payload.location,
        temperature_c: payload.temperature_c,
        humidity_pct:  payload.humidity_pct,
        battery_pct:   payload.battery_pct  ?? null,
        wifi_rssi:     payload.wifi_rssi    ?? null,
        uptime_s:      payload.uptime_s     ?? null,
        archived:      false,
        sys_cts:       new Date().toISOString(),
      };

      const created = await measurementDao.create(record);
      console.log(`[MQTT] ✅ Saved measurement ${created.id} from ${payload.device_id} | ${payload.temperature_c}°C ${payload.humidity_pct}%`);
    } catch (err) {
      console.error("[MQTT] Failed to save measurement:", err.message);
    }
  });

  client.on("reconnect", () => console.log("[MQTT] Reconnecting..."));
  client.on("offline",   () => console.warn("[MQTT] Broker offline"));
  client.on("error",     (err) => console.error("[MQTT] Error:", err.message));
}

function stopMqttListener() {
  if (client) {
    client.end();
    client = null;
  }
}

module.exports = { startMqttListener, stopMqttListener };
