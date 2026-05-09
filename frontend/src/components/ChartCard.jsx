import React from "react";
import { LineChart } from "./LineChart.jsx";

export function ChartCard({ chart, readings }) {
  return (
    <article className="chart-card" aria-labelledby={`${chart.id}ChartTitle`}>
      <div className="chart-card-heading">
        <h3 id={`${chart.id}ChartTitle`}>{chart.title}</h3>
        <span>{chart.subtitle}</span>
      </div>
      <div className="chart-wrap">
        <LineChart chart={chart} readings={readings} />
      </div>
      <div className="legend" aria-hidden="true">
        <span><i className={chart.legendClass}></i>{chart.legendLabel}</span>
        <span><i className="legend-range"></i>Optimal range</span>
      </div>
    </article>
  );
}
