import { OPTIMAL_RANGES } from "../constants/monitor.js";

export function getStatus(reading) {
  const tempOk = isInRange(reading.temperature_c, OPTIMAL_RANGES.temperature);
  const humidityOk = isInRange(reading.humidity_pct, OPTIMAL_RANGES.humidity);

  if (tempOk && humidityOk) return { label: "Optimal", className: "status-ok" };
  if (!tempOk && !humidityOk) return { label: "Check climate", className: "status-alert" };
  return { label: tempOk ? "Check humidity" : "Check temperature", className: "status-warn" };
}

export function getMetricStatus(value, range) {
  if (isInRange(value, range)) return { label: "Optimal", className: "status-ok" };
  return { label: value < range.min ? "Too low" : "Too high", className: "status-warn" };
}

export function isInRange(value, range) {
  return value >= range.min && value <= range.max;
}
