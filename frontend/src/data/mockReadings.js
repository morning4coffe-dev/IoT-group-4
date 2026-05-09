function hoursAgo(hours, minutes = 0) {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  date.setMinutes(date.getMinutes() - minutes);
  date.setSeconds(0, 0);
  return date.toISOString();
}

export const mockReadings = [
  { id: "m-001", device: "greenhouse-01", sys_cts: hoursAgo(0, 4), temperature_c: 25.2, humidity_pct: 62.4 },
  { id: "m-002", device: "greenhouse-01", sys_cts: hoursAgo(1, 0), temperature_c: 24.7, humidity_pct: 64.1 },
  { id: "m-003", device: "greenhouse-01", sys_cts: hoursAgo(2, 0), temperature_c: 24.1, humidity_pct: 66.8 },
  { id: "m-004", device: "greenhouse-01", sys_cts: hoursAgo(3, 0), temperature_c: 24.8, humidity_pct: 68.5 },
  { id: "m-005", device: "greenhouse-01", sys_cts: hoursAgo(4, 0), temperature_c: 25.9, humidity_pct: 69.7 },
  { id: "m-006", device: "greenhouse-01", sys_cts: hoursAgo(5, 0), temperature_c: 27.4, humidity_pct: 67.3 },
  { id: "m-007", device: "greenhouse-01", sys_cts: hoursAgo(6, 0), temperature_c: 28.6, humidity_pct: 63.2 },
  { id: "m-008", device: "greenhouse-01", sys_cts: hoursAgo(7, 0), temperature_c: 29.4, humidity_pct: 58.8 },
  { id: "m-009", device: "greenhouse-01", sys_cts: hoursAgo(8, 0), temperature_c: 28.3, humidity_pct: 57.1 },
  { id: "m-010", device: "greenhouse-01", sys_cts: hoursAgo(9, 0), temperature_c: 26.9, humidity_pct: 59.6 },
  { id: "m-011", device: "greenhouse-01", sys_cts: hoursAgo(10, 0), temperature_c: 25.6, humidity_pct: 62.9 },
  { id: "m-012", device: "greenhouse-01", sys_cts: hoursAgo(11, 0), temperature_c: 24.4, humidity_pct: 66.5 },
  { id: "m-013", device: "greenhouse-01", sys_cts: hoursAgo(12, 0), temperature_c: 23.5, humidity_pct: 70.4 },
  { id: "m-014", device: "greenhouse-01", sys_cts: hoursAgo(13, 0), temperature_c: 22.7, humidity_pct: 73.1 },
  { id: "m-015", device: "greenhouse-01", sys_cts: hoursAgo(14, 0), temperature_c: 21.5, humidity_pct: 76.6 },
  { id: "m-016", device: "greenhouse-01", sys_cts: hoursAgo(15, 0), temperature_c: 20.8, humidity_pct: 79.2 },
  { id: "m-017", device: "greenhouse-01", sys_cts: hoursAgo(16, 0), temperature_c: 20.4, humidity_pct: 81.1 },
  { id: "m-018", device: "greenhouse-01", sys_cts: hoursAgo(17, 0), temperature_c: 19.9, humidity_pct: 80.4 },
  { id: "m-019", device: "greenhouse-01", sys_cts: hoursAgo(18, 0), temperature_c: 20.6, humidity_pct: 77.3 },
  { id: "m-020", device: "greenhouse-01", sys_cts: hoursAgo(19, 0), temperature_c: 21.9, humidity_pct: 73.8 },
  { id: "m-021", device: "greenhouse-01", sys_cts: hoursAgo(20, 0), temperature_c: 23.2, humidity_pct: 69.9 },
  { id: "m-022", device: "greenhouse-01", sys_cts: hoursAgo(21, 0), temperature_c: 24.3, humidity_pct: 66.1 },
  { id: "m-023", device: "greenhouse-01", sys_cts: hoursAgo(22, 0), temperature_c: 25.1, humidity_pct: 63.5 },
  { id: "m-024", device: "greenhouse-01", sys_cts: hoursAgo(23, 0), temperature_c: 24.8, humidity_pct: 61.9 },
  { id: "m-025", device: "greenhouse-01", sys_cts: hoursAgo(28, 0), temperature_c: 23.3, humidity_pct: 66.5 },
  { id: "m-026", device: "greenhouse-01", sys_cts: hoursAgo(36, 0), temperature_c: 26.1, humidity_pct: 61.2 },
  { id: "m-027", device: "greenhouse-01", sys_cts: hoursAgo(48, 0), temperature_c: 22.9, humidity_pct: 72.5 },
  { id: "m-028", device: "greenhouse-01", sys_cts: hoursAgo(60, 0), temperature_c: 25.8, humidity_pct: 58.9 },
  { id: "m-029", device: "greenhouse-01", sys_cts: hoursAgo(72, 0), temperature_c: 27.6, humidity_pct: 55.4 },
  { id: "m-030", device: "greenhouse-01", sys_cts: hoursAgo(96, 0), temperature_c: 21.8, humidity_pct: 74.2 },
  { id: "m-031", device: "greenhouse-01", sys_cts: hoursAgo(120, 0), temperature_c: 24.9, humidity_pct: 63.8 },
  { id: "m-032", device: "greenhouse-01", sys_cts: hoursAgo(144, 0), temperature_c: 28.1, humidity_pct: 52.7 },
  { id: "m-033", device: "greenhouse-01", sys_cts: hoursAgo(168, 0), temperature_c: 23.6, humidity_pct: 69.4 },
  { id: "m-034", device: "greenhouse-01", sys_cts: hoursAgo(216, 0), temperature_c: 22.2, humidity_pct: 76.6 },
  { id: "m-035", device: "greenhouse-01", sys_cts: hoursAgo(288, 0), temperature_c: 26.7, humidity_pct: 60.5 },
  { id: "m-036", device: "greenhouse-01", sys_cts: hoursAgo(360, 0), temperature_c: 29.2, humidity_pct: 49.9 },
  { id: "m-037", device: "greenhouse-01", sys_cts: hoursAgo(432, 0), temperature_c: 23.9, humidity_pct: 67.1 },
  { id: "m-038", device: "greenhouse-01", sys_cts: hoursAgo(504, 0), temperature_c: 21.6, humidity_pct: 78.9 },
  { id: "m-039", device: "greenhouse-01", sys_cts: hoursAgo(576, 0), temperature_c: 24.5, humidity_pct: 65.3 },
  { id: "m-040", device: "greenhouse-01", sys_cts: hoursAgo(648, 0), temperature_c: 27.9, humidity_pct: 57.7 },
];
