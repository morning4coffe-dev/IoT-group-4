const measurementDao = require("../dao/measurementDao");
const { validateDtoIn } = require("../utils/validation");

const ERROR_PREFIX = "humigrow/measurement";

// ─── DtoIn Schemas ────────────────────────────────────────────────────────────

const createDtoInSchema = {
  device_id:     { type: "String",  required: true },
  location:      { type: "String",  required: true },
  temperature_c: { type: "Number",  required: true },
  humidity_pct:  { type: "Number",  required: true },
  battery_pct:   { type: "Number",  required: false },
  wifi_rssi:     { type: "Number",  required: false },
  uptime_s:      { type: "Number",  required: false },
};

const getDtoInSchema = {
  id: { type: "String", required: true },
};

const listDtoInSchema = {
  device_id:       { type: "String",  required: false },
  dateFrom:        { type: "String",  required: false },
  dateTo:          { type: "String",  required: false },
  includeArchived: { type: "Boolean", required: false },
  pageIndex:       { type: "Number",  required: false },
  pageSize:        { type: "Number",  required: false },
};

const archiveDtoInSchema = {
  id: { type: "String", required: true },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildValidationError(validationResult, command) {
  return {
    code: `${ERROR_PREFIX}/${command}/invalidDtoIn`,
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

  const validationResult = validateDtoIn(dtoIn, createDtoInSchema);

  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "create"));
  }

  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult, "create"), warnings });
  }

  const record = {
    device:        dtoIn.device_id,
    location:      dtoIn.location,
    temperature_c: dtoIn.temperature_c,
    humidity_pct:  dtoIn.humidity_pct,
    battery_pct:   dtoIn.battery_pct ?? null,
    wifi_rssi:     dtoIn.wifi_rssi   ?? null,
    uptime_s:      dtoIn.uptime_s    ?? null,
    sys_cts:       new Date().toISOString(),
  };

  const created = await measurementDao.create(record);

  return res.status(200).json({ measurement: created, warnings });
}

// ─── measurement/get ──────────────────────────────────────────────────────────

async function getMeasurement(req, res) {
  const dtoIn = req.query ?? {};
  const warnings = [];

  const validationResult = validateDtoIn(dtoIn, getDtoInSchema);

  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "get"));
  }

  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult, "get"), warnings });
  }

  const measurement = await measurementDao.get({ id: dtoIn.id });

  if (!measurement) {
    return res.status(404).json({
      code: `${ERROR_PREFIX}/get/measurementNotFound`,
      message: "Measurement not found.",
      id: dtoIn.id,
      warnings,
    });
  }

  return res.status(200).json({ measurement, warnings });
}

// ─── measurement/list ─────────────────────────────────────────────────────────

async function listMeasurements(req, res) {
  const rawQuery = req.query ?? {};
  const warnings = [];

  const dtoIn = {
    ...rawQuery,
    ...(rawQuery.pageIndex !== undefined && { pageIndex: Number(rawQuery.pageIndex) }),
    ...(rawQuery.pageSize  !== undefined && { pageSize:  Number(rawQuery.pageSize)  }),
    ...(rawQuery.includeArchived !== undefined && {
      includeArchived: rawQuery.includeArchived === "true" || rawQuery.includeArchived === true,
    }),
  };

  const validationResult = validateDtoIn(dtoIn, listDtoInSchema);

  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "list"));
  }

  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult, "list"), warnings });
  }

  const filters = {
    device_id:       dtoIn.device_id ?? null,
    dateFrom:        dtoIn.dateFrom  ?? null,
    dateTo:          dtoIn.dateTo    ?? null,
    includeArchived: dtoIn.includeArchived ?? false,
  };

  const pageInfo = {
    pageIndex: dtoIn.pageIndex ?? 0,
    pageSize:  dtoIn.pageSize  ?? 50,
  };

  const result = await measurementDao.list(filters, pageInfo);

  return res.status(200).json({ ...result, warnings });
}

// ─── measurement/archive ──────────────────────────────────────────────────────

async function archiveMeasurement(req, res) {
  const dtoIn = req.body ?? {};
  const warnings = [];

  const validationResult = validateDtoIn(dtoIn, archiveDtoInSchema);

  if (validationResult.unsupportedKeyList.length > 0) {
    warnings.push(buildUnsupportedKeysWarning(validationResult.unsupportedKeyList, "archive"));
  }

  if (!validationResult.valid) {
    return res.status(400).json({ ...buildValidationError(validationResult, "archive"), warnings });
  }

  const measurement = await measurementDao.get({ id: dtoIn.id });

  if (!measurement) {
    return res.status(404).json({
      code: `${ERROR_PREFIX}/archive/measurementNotFound`,
      message: "Measurement not found.",
      id: dtoIn.id,
      warnings,
    });
  }

  if (measurement.archived) {
    warnings.push({
      code: `${ERROR_PREFIX}/archive/alreadyArchived`,
      message: "Measurement is already archived.",
      id: dtoIn.id,
    });
    return res.status(200).json({ measurement, warnings });
  }

  const archived = await measurementDao.archiveById(dtoIn.id);

  return res.status(200).json({ measurement: archived, warnings });
}

module.exports = { create, getMeasurement, listMeasurements, archiveMeasurement };
