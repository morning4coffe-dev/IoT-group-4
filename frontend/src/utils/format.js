export const formatNumber = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatDateTime = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
});

export const formatTime = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

export function formatMetricValue(value, unit) {
  return `${formatNumber.format(value)}${unit === "C" ? "\u00b0C" : "%"}`;
}

export function formatRange(range, unit) {
  return `${range.min}-${range.max}${unit === "C" ? "\u00b0C" : "%"}`;
}
