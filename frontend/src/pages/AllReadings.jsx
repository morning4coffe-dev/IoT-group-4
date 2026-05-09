import React from "react";
import { ReadingsTable } from "../components/ReadingsTable.jsx";

export function AllReadings({ readings, onNavigate }) {
  return (
    <section className="panel readings-panel all-readings" aria-labelledby="allTitle">
      <div className="panel-heading all-heading">
        <div>
          <h2 id="allTitle">All Readings</h2>
          <p>Complete measurement history</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => onNavigate("dashboard")}>
          Back to dashboard
        </button>
      </div>
      <ReadingsTable readings={readings} showDevice />
    </section>
  );
}
