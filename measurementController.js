const measurementDao = require("../dao/measurementDao");
const { validateDtoIn } = require("../utils/validation");

const ERROR_PREFIX = "humigrow/measurement";

// ─── DtoIn Schemas ────────────────────────────────────────────────────────────

const createDtoInSchema = {
  device_id:     { type: "String",  required: true },
  location:      { type: "String",  required: true },
  temperature_c: { type: "Number",  required: true },
  humidity_pct:  { type: "Number",  required: true },
  wifi_rssi:     { type: "Number",  required: false },
  uptime_s:      { type: "Number",  required: false },
};

const getDtoInSchema = {
  id: { type: "String", required: true },
};

const listDtoInSchema = {
  device_id:  { type: "String", required: false },
  dateFrom:   { type: "String", required: false },
  dateTo:     { type: "String", required: false },
  pageIndex:  { type: "Number", required: false },
  pageSize:   { type: "Number", required: false },
};

const deleteDtoInSchema = {
  id: { type: "String", required: true },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildValidationError(validationResult) {
  return {
    code: `${ERROR_PREFIX}/create/invalidDtoIn`,
    message: "DtoIn is not valid.",
    invalidTypeKeyMap:  validationResult.invalidTypeKeyMap,
    invalidValueKeyMap: validationResult.invalidValueKeyMap,
    missingKeyMap:      validationResult.missingKeyMap,
  };
}

function buildUnsupportedKeysWarning(unsupportedKeyList, command) {
  return {
    code: `${ERROR_PREFIX}/${command}/unsupportedKeys`,
    message: "DtoIn contains unsupported keys.",
    unsupportedKeyList,
  };
}

// ─── measurement/create ───────────────────────────────────────────────────────

async function create(req, res) {
  const dtoIn = req.body ?? {};
  const warnings = [];

  // 1.1 Validate dtoIn
  const validationResult = validateDtoIn(dtoIn, createDtoInSchema);

  // 1.2–1.3 Unsupported keys → warning
  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "create"));
  }

  // 1.1 Invalid dtoIn → error
  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult), warnings });
  }

  // 1.4 Optional keys default to null
  const record = {
    device:        dtoIn.device_id,
    location:      dtoIn.location,
    temperature_c: dtoIn.temperature_c,
    humidity_pct:  dtoIn.humidity_pct,
    wifi_rssi:     dtoIn.wifi_rssi  ?? null,
    uptime_s:      dtoIn.uptime_s   ?? null,
    sys_cts:       new Date().toISOString(),
  };

  // 2. Save to DB
  const created = await measurementDao.create(record);

  // 3. Return dtoOut
  return res.status(200).json({ measurement: created, warnings });
}

// ─── measurement/get ──────────────────────────────────────────────────────────

async function getMeasurement(req, res) {
  const dtoIn = req.query ?? {};
  const warnings = [];

  // 1.1 Validate
  const validationResult = validateDtoIn(dtoIn, getDtoInSchema);

  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "get"));
  }

  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult), warnings });
  }

  // 2. Find measurement
  const measurement = await measurementDao.get({ id: dtoIn.id });

  // 2.1 Not found → error
  if (!measurement) {
    return res.status(404).json({
      code: `${ERROR_PREFIX}/get/measurementNotFound`,
      message: "Measurement not found.",
      id: dtoIn.id,
      warnings,
    });
  }

  // 3. Return dtoOut
  return res.status(200).json({ measurement, warnings });
}

// ─── measurement/list ─────────────────────────────────────────────────────────

async function listMeasurements(req, res) {
  const rawQuery = req.query ?? {};
  const warnings = [];

  // Parse numeric query params (query strings are always strings)
  const dtoIn = {
    ...rawQuery,
    ...(rawQuery.pageIndex !== undefined && { pageIndex: Number(rawQuery.pageIndex) }),
    ...(rawQuery.pageSize  !== undefined && { pageSize:  Number(rawQuery.pageSize)  }),
  };

  // 1.1 Validate
  const validationResult = validateDtoIn(dtoIn, listDtoInSchema);

  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "list"));
  }

  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult), warnings });
  }

  // 1.2.2 Defaults
  const filters = {
    device_id: dtoIn.device_id ?? null,
    dateFrom:  dtoIn.dateFrom  ?? null,
    dateTo:    dtoIn.dateTo    ?? null,
  };

  const pageInfo = {
    pageIndex: dtoIn.pageIndex ?? 0,
    pageSize:  dtoIn.pageSize  ?? 50,
  };

  // 2–3. Query DB with filters and pagination
  const result = await measurementDao.list(filters, pageInfo);

  // 4. Return dtoOut
  return res.status(200).json({ ...result, warnings });
}

// ─── measurement/delete ───────────────────────────────────────────────────────

async function deleteMeasurement(req, res) {
  const dtoIn = req.body ?? {};
  const warnings = [];

  // 1.1 Validate
  const validationResult = validateDtoIn(dtoIn, deleteDtoInSchema);

  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "delete"));
  }

  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult), warnings });
  }

  // 2. Check existence
  const measurement = await measurementDao.get({ id: dtoIn.id });

  // 2.1 Not found → error
  if (!measurement) {
    return res.status(404).json({
      code: `${ERROR_PREFIX}/delete/measurementNotFound`,
      message: "Measurement not found.",
      id: dtoIn.id,
      warnings,
    });
  }

  // 3. Delete
  await measurementDao.deleteById(dtoIn.id);

  // 4. Return dtoOut
  return res.status(200).json({ id: dtoIn.id, warnings });
}

module.exports = { create, getMeasurement, listMeasurements, deleteMeasurement };
