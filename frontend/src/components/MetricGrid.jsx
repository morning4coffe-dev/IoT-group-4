import React from "react";
import { METRIC_CONFIG, OPTIMAL_RANGES } from "../constants/monitor.js";
import { formatMetricValue, formatRange } from "../utils/format.js";
import { getMetricStatus } from "../utils/status.js";
import { HumidityIcon } from "./icons/HumidityIcon.jsx";
import { TemperatureIcon } from "./icons/TemperatureIcon.jsx";

export function MetricGrid({ latestReading }) {
  return (
    <div className="metric-grid">
      {METRIC_CONFIG.map((metric) => {
        const range = OPTIMAL_RANGES[metric.key];
        const status = getMetricStatus(latestReading[metric.valueKey], range);

        return (
          <article className="metric-card" key={metric.key}>
            <div className="metric-main">
              <span className={`metric-icon ${metric.iconClass}`}>
                {metric.key === "temperature" ? <TemperatureIcon /> : <HumidityIcon />}
              </span>
              <div>
                <p>{metric.label}</p>
                <strong>{formatMetricValue(latestReading[metric.valueKey], metric.unit)}</strong>
              </div>
            </div>
            <dl>
              <div>
                <dt>Status</dt>
                <dd className={status.className}>{status.label}</dd>
              </div>
              <div>
                <dt>Range</dt>
                <dd>{formatRange(range, metric.unit)}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}
