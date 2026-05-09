import React from "react";
import { formatDateTime, formatMetricValue } from "../utils/format.js";
import { getStatus } from "../utils/status.js";

export function ReadingsTable({ readings, showDevice }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Time</th>
            <th>Temperature</th>
            <th>Humidity</th>
            <th>Status</th>
            {showDevice ? <th>Device</th> : null}
          </tr>
        </thead>
        <tbody>
          {readings.map((reading) => {
            const status = getStatus(reading);

            return (
              <tr key={reading.id}>
                <td><span className={`dot ${status.className}`} aria-label={status.label}></span></td>
                <td>{formatDateTime.format(new Date(reading.sys_cts))}</td>
                <td>{formatMetricValue(reading.temperature_c, "C")}</td>
                <td>{formatMetricValue(reading.humidity_pct, "%")}</td>
                <td><span className={`table-status ${status.className}`}>{status.label}</span></td>
                {showDevice ? <td>{reading.device}</td> : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
