const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/measurementController");

// Async error wrapper – forwards thrown errors to Express error handler
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// POST /humigrow/measurement/create
router.post("/measurement/create", wrap(ctrl.create));

// GET  /humigrow/measurement/get?id=...
router.get("/measurement/get", wrap(ctrl.getMeasurement));

// GET  /humigrow/measurement/list?device_id=...&dateFrom=...&dateTo=...&pageIndex=...&pageSize=...
router.get("/measurement/list", wrap(ctrl.listMeasurements));

// DELETE /humigrow/measurement/delete
router.delete("/measurement/delete", wrap(ctrl.deleteMeasurement));

module.exports = router;
