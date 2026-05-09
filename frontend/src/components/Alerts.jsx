import React from "react";
import { METRIC_CONFIG, OPTIMAL_RANGES } from "../constants/monitor.js";
import { formatMetricValue, formatRange } from "../utils/format.js";
import { getMetricStatus } from "../utils/status.js";

export function Alerts({ latestReading }) {
  const alerts = METRIC_CONFIG
    .map((metric) => {
      const range = OPTIMAL_RANGES[metric.key];
      const value = latestReading[metric.valueKey];
      const status = getMetricStatus(value, range);

      if (status.label === "Optimal") return null;

      return {
        label: metric.label,
        value: formatMetricValue(value, metric.unit),
        range: formatRange(range, metric.unit),
        direction: status.label.toLowerCase(),
      };
    })
    .filter(Boolean);

  if (alerts.length === 0) return null;

  return (
    <div className="alert-stack" aria-live="polite">
      {alerts.map((alert) => (
        <div className="alert-card" role="alert" key={alert.label}>
          <span className="alert-icon" aria-hidden="true">!</span>
          <div>
            <strong>{alert.label} is {alert.direction}</strong>
            <p>Current value is {alert.value}. Optimal range is {alert.range}.</p>
          </div>
        </div>
      ))}
    </div>
  );
}
