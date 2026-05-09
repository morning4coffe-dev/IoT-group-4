import React, { useMemo, useState } from "react";
import { Alerts } from "../components/Alerts.jsx";
import { HistoricalData } from "../components/HistoricalData.jsx";
import { MetricGrid } from "../components/MetricGrid.jsx";
import { ReadingsPanel } from "../components/ReadingsPanel.jsx";
import { getFilteredReadings } from "../utils/readings.js";

export function Dashboard({ latestReading, readings, onNavigate }) {
  const [range, setRange] = useState("24h");
  const filteredReadings = useMemo(() => getFilteredReadings(readings, range), [readings, range]);

  return (
    <section>
      <Alerts latestReading={latestReading} />
      <MetricGrid latestReading={latestReading} />
      <HistoricalData range={range} readings={filteredReadings} onRangeChange={setRange} />
      <ReadingsPanel
        title="Recent Readings"
        readings={readings.slice(0, 10)}
        footer={(
          <button className="secondary-button" type="button" onClick={() => onNavigate("readings")}>
            View all readings
          </button>
        )}
      />
    </section>
  );
}
