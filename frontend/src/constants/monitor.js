export const OPTIMAL_RANGES = {
  temperature: { min: 18, max: 28, unit: "C" },
  humidity: { min: 50, max: 80, unit: "%" },
};

export const RANGE_HOURS = {
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

export const METRIC_CONFIG = [
  {
    key: "temperature",
    label: "Temperature",
    valueKey: "temperature_c",
    unit: "C",
    iconClass: "temperature-icon",
  },
  {
    key: "humidity",
    label: "Humidity",
    valueKey: "humidity_pct",
    unit: "%",
    iconClass: "humidity-icon",
  },
];

export const CHART_CONFIG = [
  {
    id: "temperature",
    title: "Temperature",
    subtitle: "Optimal 18-28\u00b0C",
    key: "temperature_c",
    label: "Temperature (C)",
    color: "#ff7500",
    range: OPTIMAL_RANGES.temperature,
    maxValue: 40,
    legendClass: "legend-temp",
    legendLabel: "Temperature (\u00b0C)",
  },
  {
    id: "humidity",
    title: "Humidity",
    subtitle: "Optimal 50-80%",
    key: "humidity_pct",
    label: "Humidity (%)",
    color: "#2079ff",
    range: OPTIMAL_RANGES.humidity,
    maxValue: 100,
    legendClass: "legend-humidity",
    legendLabel: "Humidity (%)",
  },
];
