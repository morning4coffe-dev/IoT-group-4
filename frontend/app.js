import { OPTIMAL_RANGES, fetchReadings } from "./data.js";

const state = {
  readings: [],
  range: "24h",
  chart: null,
};

const rangeHours = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

const formatNumber = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const formatDateTime = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

const formatTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const metricConfig = [
  {
    key: "temperature",
    label: "Temperature",
    valueKey: "temperature_c",
    unit: "C",
    iconClass: "temperature-icon",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 14.76V5a4 4 0 0 0-8 0v9.76a6 6 0 1 0 8 0Z"/><path d="M10 5v10"/><path d="M10 19a2 2 0 0 0 1.1-3.67"/></svg>`,
  },
  {
    key: "humidity",
    label: "Humidity",
    valueKey: "humidity_pct",
    unit: "%",
    iconClass: "humidity-icon",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c3.3 3.7 6 7.1 6 10.7a6 6 0 0 1-12 0c0-3.6 2.7-7 6-10.7Z"/><path d="M14.9 11.7a3.2 3.2 0 0 1-4.5 4.5"/></svg>`,
  },
];

function getStatus(reading) {
  const tempOk = isInRange(reading.temperature_c, OPTIMAL_RANGES.temperature);
  const humidityOk = isInRange(reading.humidity_pct, OPTIMAL_RANGES.humidity);

  if (tempOk && humidityOk) return { label: "Optimal", className: "status-ok" };
  if (!tempOk && !humidityOk) return { label: "Check climate", className: "status-alert" };
  return { label: tempOk ? "Check humidity" : "Check temperature", className: "status-warn" };
}

function getMetricStatus(value, range) {
  if (isInRange(value, range)) return { label: "Optimal", className: "status-ok" };
  return { label: value < range.min ? "Too low" : "Too high", className: "status-warn" };
}

function isInRange(value, range) {
  return value >= range.min && value <= range.max;
}

function getLatestReading() {
  return [...state.readings].sort((a, b) => new Date(b.sys_cts) - new Date(a.sys_cts))[0];
}

function getFilteredReadings() {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - rangeHours[state.range]);

  return state.readings
    .filter((reading) => new Date(reading.sys_cts) >= cutoff)
    .sort((a, b) => new Date(a.sys_cts) - new Date(b.sys_cts));
}

function renderMetrics() {
  const latest = getLatestReading();
  const container = document.getElementById("metricGrid");

  container.innerHTML = metricConfig
    .map((metric) => {
      const range = OPTIMAL_RANGES[metric.key];
      const status = getMetricStatus(latest[metric.valueKey], range);
      const value = `${formatNumber.format(latest[metric.valueKey])}${metric.unit === "C" ? "&deg;C" : "%"}`;

      return `
        <article class="metric-card">
          <div class="metric-main">
            <span class="metric-icon ${metric.iconClass}">${metric.icon}</span>
            <div>
              <p>${metric.label}</p>
              <strong>${value}</strong>
            </div>
          </div>
          <dl>
            <div>
              <dt>Status</dt>
              <dd class="${status.className}">${status.label}</dd>
            </div>
            <div>
              <dt>Range</dt>
              <dd>${range.min}-${range.max}${metric.unit === "C" ? "&deg;C" : "%"}</dd>
            </div>
          </dl>
        </article>
      `;
    })
    .join("");
}

function renderAlerts() {
  const latest = getLatestReading();
  const container = document.getElementById("alertStack");
  const alerts = metricConfig
    .map((metric) => {
      const range = OPTIMAL_RANGES[metric.key];
      const value = latest[metric.valueKey];
      const status = getMetricStatus(value, range);

      if (status.label === "Optimal") return null;

      return {
        label: metric.label,
        value: `${formatNumber.format(value)}${metric.unit === "C" ? "°C" : "%"}`,
        range: `${range.min}-${range.max}${metric.unit === "C" ? "°C" : "%"}`,
        direction: status.label.toLowerCase(),
      };
    })
    .filter(Boolean);

  container.hidden = alerts.length === 0;
  container.innerHTML = alerts
    .map(
      (alert) => `
        <div class="alert-card" role="alert">
          <span class="alert-icon" aria-hidden="true">!</span>
          <div>
            <strong>${alert.label} is ${alert.direction}</strong>
            <p>Current value is ${alert.value}. Optimal range is ${alert.range}.</p>
          </div>
        </div>
      `,
    )
    .join("");
}

function renderReadings(tableId, readings) {
  const table = document.getElementById(tableId);
  const isAllTable = tableId === "allReadings";

  table.innerHTML = readings
    .map((reading) => {
      const status = getStatus(reading);
      const deviceColumn = isAllTable ? `<td>${reading.device}</td>` : "";

      return `
        <tr>
          <td><span class="dot ${status.className}" aria-label="${status.label}"></span></td>
          <td>${formatDateTime.format(new Date(reading.sys_cts))}</td>
          <td>${formatNumber.format(reading.temperature_c)}&deg;C</td>
          <td>${formatNumber.format(reading.humidity_pct)}%</td>
          <td><span class="table-status ${status.className}">${status.label}</span></td>
          ${deviceColumn}
        </tr>
      `;
    })
    .join("");
}

function setupChart() {
  const canvas = document.getElementById("historyChart");
  const context = canvas.getContext("2d");
  state.chart = { canvas, context };

  const resizeObserver = new ResizeObserver(() => drawChart());
  resizeObserver.observe(canvas.parentElement);
}

function setCanvasSize() {
  const { canvas } = state.chart;
  const rect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  state.chart.context.setTransform(ratio, 0, 0, ratio, 0, 0);

  return { width: rect.width, height: rect.height };
}

function drawChart() {
  if (!state.chart) return;

  const readings = getFilteredReadings();
  const { context } = state.chart;
  const { width, height } = setCanvasSize();
  const padding = getChartPadding(width);
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  context.clearRect(0, 0, width, height);
  drawGrid(context, padding, plotWidth, plotHeight);

  if (readings.length < 2) {
    drawEmptyChart(context, width, height);
    return;
  }

  const scaleX = (index) => padding.left + (index / (readings.length - 1)) * plotWidth;
  const scaleY = (value) => padding.top + (1 - value / 100) * plotHeight;

  drawOptimalLines(context, padding, plotWidth, scaleY);
  drawSeries(context, readings, "humidity_pct", "#2079ff", scaleX, scaleY);
  drawSeries(context, readings, "temperature_c", "#ff7500", scaleX, scaleY);
  drawAxesLabels(context, readings, padding, plotWidth, plotHeight, scaleX);
}

function getChartPadding(width) {
  return width < 620
    ? { top: 18, right: 14, bottom: 44, left: 38 }
    : { top: 22, right: 34, bottom: 54, left: 64 };
}

function drawGrid(context, padding, plotWidth, plotHeight) {
  context.save();
  context.strokeStyle = getCssVar("--line");
  context.fillStyle = getCssVar("--muted");
  context.lineWidth = 1;
  context.font = "12px Inter, system-ui, sans-serif";

  [0, 25, 50, 75, 100].forEach((tick) => {
    const y = padding.top + (1 - tick / 100) * plotHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(padding.left + plotWidth, y);
    context.stroke();
    context.fillText(String(tick), padding.left - 32, y + 4);
  });

  context.restore();
}

function drawOptimalLines(context, padding, plotWidth, scaleY) {
  context.save();
  context.strokeStyle = "rgba(255, 88, 88, .85)";
  context.setLineDash([6, 5]);
  context.lineWidth = 1;

  [OPTIMAL_RANGES.temperature.min, OPTIMAL_RANGES.temperature.max, OPTIMAL_RANGES.humidity.min, OPTIMAL_RANGES.humidity.max]
    .filter((value, index, values) => values.indexOf(value) === index)
    .forEach((value) => {
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

function drawAxesLabels(context, readings, padding, plotWidth, plotHeight, scaleX) {
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
  context.fillText("Temperature (C) / Humidity (%)", 0, 0);
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

function setupRangeControls() {
  document.querySelectorAll(".range-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.range = button.dataset.range;
      document.querySelectorAll(".range-button").forEach((item) => item.classList.toggle("active", item === button));
      drawChart();
    });
  });
}

function setupThemeToggle() {
  const button = document.getElementById("themeToggle");
  button.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    drawChart();
  });
}

function renderCurrentView() {
  const params = new URLSearchParams(window.location.search);
  const showAll = params.get("view") === "all";
  const sorted = [...state.readings].sort((a, b) => new Date(b.sys_cts) - new Date(a.sys_cts));

  document.getElementById("dashboardView").hidden = showAll;
  document.getElementById("allReadingsView").hidden = !showAll;

  renderReadings("recentReadings", sorted.slice(0, 10));
  renderReadings("allReadings", sorted);

  if (!showAll) {
    renderMetrics();
    renderAlerts();
    drawChart();
  }
}

async function init() {
  state.readings = await fetchReadings();
  setupRangeControls();
  setupThemeToggle();
  setupChart();
  renderCurrentView();
}

init();
