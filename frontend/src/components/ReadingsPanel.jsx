import React from "react";
import { ReadingsTable } from "./ReadingsTable.jsx";

export function ReadingsPanel({ title, readings, footer, showDevice = false }) {
  const titleId = `${title.replaceAll(" ", "")}Title`;

  return (
    <section className="panel readings-panel" aria-labelledby={titleId}>
      <div className="panel-heading">
        <h2 id={titleId}>{title}</h2>
      </div>
      <ReadingsTable readings={readings} showDevice={showDevice} />
      {footer ? <div className="panel-footer">{footer}</div> : null}
    </section>
  );
}
