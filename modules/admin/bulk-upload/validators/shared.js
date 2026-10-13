// Parsing/normalization helpers shared by every per-sheet validator. Kept
// separate from resolvers.js, which deals with DB-backed lookups instead of
// raw cell parsing.

const { generateSlug } = require("../../../../utils/slugHelper");

// A row whose cells are all blank (after trim) is ignored silently, not
// reported as an error (spec §11 "ignore fully blank rows").
const isBlankRow = (row, columns) =>
  columns.every((col) => {
    const value = row[col.key];
    return value === undefined || value === null || String(value).trim() === "";
  });

// Spec: rows whose first cell starts with "EXAMPLE" are the prefilled
// example row and are always skipped, never imported.
const isExampleRow = (row, firstColumnKey) => {
  const value = row[firstColumnKey];
  return typeof value === "string" && value.trim().toUpperCase().startsWith("EXAMPLE");
};

const trimOrUndefined = (value) => {
  if (value === undefined || value === null) return undefined;
  const trimmed = String(value).trim();
  return trimmed === "" ? undefined : trimmed;
};

const parseBoolean = (value, defaultValue) => {
  const trimmed = trimOrUndefined(value);
  if (trimmed === undefined) return { ok: true, value: defaultValue };
  const upper = trimmed.toUpperCase();
  if (upper === "TRUE") return { ok: true, value: true };
  if (upper === "FALSE") return { ok: true, value: false };
  return { ok: false, value: undefined };
};

const parseInteger = (value, { defaultValue, min } = {}) => {
  const trimmed = trimOrUndefined(value);
  if (trimmed === undefined) return { ok: true, value: defaultValue };
  const num = Number(trimmed);
  if (!Number.isInteger(num)) return { ok: false, value: undefined };
  if (min !== undefined && num < min) return { ok: false, value: undefined };
  return { ok: true, value: num };
};

const parseDecimal = (value, { defaultValue, min, maxDecimals } = {}) => {
  const trimmed = trimOrUndefined(value);
  if (trimmed === undefined) return { ok: true, value: defaultValue };
  const num = Number(trimmed);
  if (Number.isNaN(num)) return { ok: false, value: undefined };
  if (min !== undefined && num < min) return { ok: false, value: undefined };
  if (maxDecimals !== undefined) {
    const decimalPart = trimmed.split(".")[1];
    if (decimalPart && decimalPart.length > maxDecimals) return { ok: false, value: undefined };
  }
  return { ok: true, value: num };
};

const normalizeSlugCell = (value) => {
  const trimmed = trimOrUndefined(value);
  if (trimmed === undefined) return undefined;
  return generateSlug(trimmed);
};

// Case-insensitive, trimmed lookup key — used to build Map<key, row/id> from
// both sheet rows and preloaded DB rows so the two can be cross-referenced.
const lookupKey = (value) => (trimOrUndefined(value) || "").toLowerCase();

module.exports = {
  isBlankRow,
  isExampleRow,
  trimOrUndefined,
  parseBoolean,
  parseInteger,
  parseDecimal,
  normalizeSlugCell,
  lookupKey,
};
