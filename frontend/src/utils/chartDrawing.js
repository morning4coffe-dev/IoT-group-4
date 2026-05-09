import { formatTime } from "./format.js";

export function drawChart(canvas, chart, readings) {
  if (!canvas) return;

  const context = canvas.getContext("2d");
  const { width, height } = setCanvasSize(canvas, context);
  const padding = getChartPadding(width);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  context.clearRect(0, 0, width, height);
  drawGrid(context, padding, plotWidth, plotHeight, chart.maxValue);

  if (readings.length < 2) {
    drawEmptyChart(context, width, height);
    return;
  }

  const scaleX = (index) => padding.left + (index / (readings.length - 1)) * plotWidth;
  const scaleY = (value) => padding.top + (1 - value / chart.maxValue) * plotHeight;

  drawOptimalLines(context, padding, plotWidth, scaleY, chart.range);
  drawSeries(context, readings, chart.key, chart.color, scaleX, scaleY);
  drawAxesLabels(context, readings, padding, plotWidth, plotHeight, scaleX, chart.label);
}

function setCanvasSize(canvas, context) {
  const rect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  return { width: rect.width, height: rect.height };
}

function getChartPadding(width) {
  return width < 620
    ? { top: 18, right: 14, bottom: 44, left: 38 }
    : { top: 22, right: 34, bottom: 54, left: 64 };
}

function drawGrid(context, padding, plotWidth, plotHeight, maxValue) {
  context.save();
  context.strokeStyle = getCssVar("--line");
  context.fillStyle = getCssVar("--muted");
  context.lineWidth = 1;
  context.font = "12px Inter, system-ui, sans-serif";

  const ticks = maxValue === 40 ? [0, 10, 20, 30, 40] : [0, 25, 50, 75, 100];

  ticks.forEach((tick) => {
    const y = padding.top + (1 - tick / maxValue) * plotHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(padding.left + plotWidth, y);
    context.stroke();
    context.fillText(String(tick), padding.left - 32, y + 4);
  });

  context.restore();
}

function drawOptimalLines(context, padding, plotWidth, scaleY, range) {
  context.save();
  context.strokeStyle = "rgba(255, 88, 88, .85)";
  context.setLineDash([6, 5]);
  context.lineWidth = 1;

  [range.min, range.max].forEach((value) => {
    context.beginPath();
    context.moveTo(padding.left, scaleY(value));
    context.lineTo(padding.left + plotWidth, scaleY(value));
    context.stroke();
  });

  context.restore();
}

function drawSeries(context, readings, key, color, scaleX, scaleY) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = 2.5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  readings.forEach((reading, index) => {
    const x = scaleX(index);
    const y = scaleY(reading[key]);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });

  context.stroke();
  context.restore();
}

function drawAxesLabels(context, readings, padding, plotWidth, plotHeight, scaleX, yAxisLabel) {
  context.save();
  context.fillStyle = getCssVar("--muted");
  context.font = "12px Inter, system-ui, sans-serif";
  context.textAlign = "center";

  const labelCount = Math.min(readings.length, window.innerWidth < 720 ? 4 : 8);
  const step = Math.max(1, Math.floor((readings.length - 1) / (labelCount - 1)));

  readings.forEach((reading, index) => {
    if (index % step !== 0 && index !== readings.length - 1) return;
    context.fillText(formatTime.format(new Date(reading.sys_cts)), scaleX(index), padding.top + plotHeight + 28);
  });

  context.save();
  context.translate(14, padding.top + plotHeight / 2);
  context.rotate(-Math.PI / 2);
  context.textAlign = "center";
  context.fillText(yAxisLabel, 0, 0);
  context.restore();

  context.restore();
}

function drawEmptyChart(context, width, height) {
  context.save();
  context.fillStyle = getCssVar("--muted");
  context.textAlign = "center";
  context.font = "14px Inter, system-ui, sans-serif";
  context.fillText("No readings in this range", width / 2, height / 2);
  context.restore();
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
