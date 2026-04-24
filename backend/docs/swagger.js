const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "HumiGrow Backend API",
      version: "1.0.0",
      description:
        "REST API for HumiGrow IoT temperature/humidity/battery measurements. Follows UU App pattern (dtoIn/dtoOut, warnings, error codes).",
    },
    servers: [{ url: "/", description: "This server" }],
    tags: [{ name: "Measurement", description: "Measurement records from IoT nodes." }],
    components: {
      schemas: {
        MeasurementCreateDtoIn: {
          type: "object",
          required: ["device_id", "location", "temperature_c", "humidity_pct"],
          properties: {
            device_id:     { type: "string",  example: "sklenik-esp-01" },
            location:      { type: "string",  example: "sklenik" },
            temperature_c: { type: "number",  example: 23.5 },
            humidity_pct:  { type: "number",  example: 60.2 },
            battery_pct:   { type: "number",  example: 87.4, description: "Battery charge in %." },
            wifi_rssi:     { type: "number",  example: -72 },
            uptime_s:      { type: "number",  example: 3600 },
          },
        },
        Measurement: {
          type: "object",
          properties: {
            id:            { type: "string", format: "uuid" },
            device:        { type: "string" },
            location:      { type: "string" },
            temperature_c: { type: "number" },
            humidity_pct:  { type: "number" },
            battery_pct:   { type: "number", nullable: true },
            wifi_rssi:     { type: "integer", nullable: true },
            uptime_s:      { type: "integer", nullable: true },
            archived:      { type: "boolean" },
            archived_cts:  { type: "string", format: "date-time", nullable: true },
            sys_cts:       { type: "string", format: "date-time" },
          },
        },
        MeasurementDtoOut: {
          type: "object",
          properties: {
            measurement: { $ref: "#/components/schemas/Measurement" },
            warnings:    { type: "array", items: { type: "object" } },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "..", "routes", "*.js")],
};

module.exports = swaggerJsdoc(options);
