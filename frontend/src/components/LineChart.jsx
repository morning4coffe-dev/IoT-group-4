import React, { useEffect, useRef } from "react";
import { drawChart } from "../utils/chartDrawing.js";

export function LineChart({ chart, readings }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeObserver = new ResizeObserver(() => drawChart(canvas, chart, readings));

    resizeObserver.observe(canvas.parentElement);
    drawChart(canvas, chart, readings);

    return () => resizeObserver.disconnect();
  }, [chart, readings]);

  return <canvas ref={canvasRef} aria-label={`${chart.title} historical chart`} />;
}
