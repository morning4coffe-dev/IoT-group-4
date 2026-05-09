import { RANGE_HOURS } from "../constants/monitor.js";

export function sortReadingsNewestFirst(readings) {
  return [...readings].sort((a, b) => new Date(b.sys_cts) - new Date(a.sys_cts));
}

export function getFilteredReadings(readings, range) {
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - RANGE_HOURS[range]);

  return readings
    .filter((reading) => new Date(reading.sys_cts) >= cutoff)
    .sort((a, b) => new Date(a.sys_cts) - new Date(b.sys_cts));
}
