import React, { useMemo } from "react";
import { Topbar } from "./components/Topbar.jsx";
import { useMeasurements } from "./hooks/useMeasurements.js";
import { useRoute } from "./hooks/useRoute.js";
import { useTheme } from "./hooks/useTheme.js";
import { AllReadings } from "./pages/AllReadings.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { sortReadingsNewestFirst } from "./utils/readings.js";

export function App() {
  const { readings, isLoading } = useMeasurements();
  const { route, navigate } = useRoute();
  const { toggleTheme } = useTheme();

  const sortedReadings = useMemo(() => sortReadingsNewestFirst(readings), [readings]);
  const latestReading = sortedReadings[0];

  return (
    <>
      <Topbar onNavigate={navigate} onToggleTheme={toggleTheme} />
      <main className="page-shell">
        {isLoading || !latestReading ? (
          <section className="panel">
            <h2>Loading readings</h2>
          </section>
        ) : route === "readings" ? (
          <AllReadings readings={sortedReadings} onNavigate={navigate} />
        ) : (
          <Dashboard latestReading={latestReading} readings={sortedReadings} onNavigate={navigate} />
        )}
      </main>
    </>
  );
}
