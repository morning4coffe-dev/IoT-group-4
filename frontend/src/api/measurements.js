import { mockReadings } from "../data/mockReadings.js";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

const API_CONFIG = {
  listUrl: `${BASE_URL}/humigrow/measurement/list`,
  pageSize: 1000,
};

function normalizeReading(reading) {
  return {
    id: reading.id,
    device: reading.device || reading.device_id || "greenhouse-01",
    sys_cts: reading.sys_cts || reading.createdAt || reading.time,
    temperature_c: Number(reading.temperature_c ?? reading.temperature),
    humidity_pct: Number(reading.humidity_pct ?? reading.humidity),
  };
}

export async function fetchReadings() {
  try {
    const response = await fetch(`${API_CONFIG.listUrl}?pageSize=${API_CONFIG.pageSize}`);
    if (!response.ok) throw new Error(`API responded ${response.status}`);

    const payload = await response.json();
    const readings = (payload.itemList || payload.measurements || [])
      .map(normalizeReading)
      .filter((reading) => reading.sys_cts && Number.isFinite(reading.temperature_c) && Number.isFinite(reading.humidity_pct));

    if (readings.length > 0) return readings;
  } catch (error) {
    console.info("Using mock greenhouse readings:", error.message);
  }

  return mockReadings.map(normalizeReading);
}
