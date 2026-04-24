/**
 * Validates dtoIn against a schema.
 * Returns { valid, invalidTypeKeyMap, invalidValueKeyMap, missingKeyMap, unsupportedKeyList }
 */
function validateDtoIn(dtoIn, schema) {
  const invalidTypeKeyMap = {};
  const invalidValueKeyMap = {};
  const missingKeyMap = {};
  const unsupportedKeyList = [];

  // Check for unsupported keys
  for (const key of Object.keys(dtoIn)) {
    if (!schema[key]) {
      unsupportedKeyList.push(key);
    }
  }

  // Check required keys and types
  for (const [key, rules] of Object.entries(schema)) {
    const value = dtoIn[key];
    const isPresent = value !== undefined && value !== null;

    if (rules.required && !isPresent) {
      missingKeyMap[key] = { expected: rules.type };
      continue;
    }

    if (!isPresent) continue;

    const actualType = Array.isArray(value) ? "Array" : capitalize(typeof value);
    if (actualType !== rules.type) {
      invalidTypeKeyMap[key] = { expected: rules.type, actual: actualType };
    }

    // Value-level validations
    if (rules.type === "Number" && isPresent) {
      if (!isFinite(value)) {
        invalidValueKeyMap[key] = { reason: "Must be a finite number." };
      }
    }

    if (rules.type === "String" && isPresent) {
      if (typeof value === "string" && value.trim().length === 0) {
        invalidValueKeyMap[key] = { reason: "Must not be empty." };
      }
    }
  }

  const valid =
    Object.keys(invalidTypeKeyMap).length === 0 &&
    Object.keys(invalidValueKeyMap).length === 0 &&
    Object.keys(missingKeyMap).length === 0;

  return { valid, invalidTypeKeyMap, invalidValueKeyMap, missingKeyMap, unsupportedKeyList };
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { validateDtoIn };
