const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/measurementController");

// Async error wrapper – forwards thrown errors to Express error handler
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * @openapi
 * /humigrow/measurement/create:
 *   post:
 *     tags: [Measurement]
 *     summary: Create a new measurement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/MeasurementCreateDtoIn"
 *     responses:
 *       "200":
 *         description: Measurement created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/MeasurementDtoOut"
 *       "400":
 *         description: Invalid dtoIn.
 */
router.post("/measurement/create", wrap(ctrl.create));

/**
 * @openapi
 * /humigrow/measurement/get:
 *   get:
 *     tags: [Measurement]
 *     summary: Get a single measurement by id.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: Measurement found.
 *       "404":
 *         description: Measurement not found.
 */
router.get("/measurement/get", wrap(ctrl.getMeasurement));

/**
 * @openapi
 * /humigrow/measurement/list:
 *   get:
 *     tags: [Measurement]
 *     summary: List measurements (paginated, optional filters).
 *     parameters:
 *       - in: query
 *         name: device_id
 *         schema: { type: string }
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: includeArchived
 *         schema: { type: boolean, default: false }
 *       - in: query
 *         name: pageIndex
 *         schema: { type: integer, minimum: 0, default: 0 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, minimum: 1, maximum: 1000, default: 50 }
 *     responses:
 *       "200":
 *         description: Paginated list.
 */
router.get("/measurement/list", wrap(ctrl.listMeasurements));

/**
 * @openapi
 * /humigrow/measurement/archive:
 *   post:
 *     tags: [Measurement]
 *     summary: Archive a measurement (soft-delete, history preserved).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id]
 *             properties:
 *               id: { type: string, format: uuid }
 *     responses:
 *       "200":
 *         description: Measurement archived.
 *       "404":
 *         description: Measurement not found.
 */
router.post("/measurement/archive", wrap(ctrl.archiveMeasurement));

module.exports = router;
