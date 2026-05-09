import React from "react";
import { CHART_CONFIG, RANGE_HOURS } from "../constants/monitor.js";
import { ChartCard } from "./ChartCard.jsx";

export function HistoricalData({ range, readings, onRangeChange }) {
  return (
    <section className="panel chart-panel" aria-labelledby="chartTitle">
      <div className="panel-heading">
        <h2 id="chartTitle">Historical Data</h2>
        <div className="segmented-control" role="group" aria-label="Chart range">
          {Object.keys(RANGE_HOURS).map((rangeOption) => (
            <button
              className={`range-button ${range === rangeOption ? "active" : ""}`}
              data-range={rangeOption}
              key={rangeOption}
              type="button"
              onClick={() => onRangeChange(rangeOption)}
            >
              {rangeOption}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-grid">
        {CHART_CONFIG.map((chart) => (
          <ChartCard chart={chart} readings={readings} key={chart.id} />
        ))}
      </div>
    </section>
  );
}
