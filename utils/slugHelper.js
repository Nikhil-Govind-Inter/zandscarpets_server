const slugify = require("slugify");
const { Op } = require("sequelize");
const { CustomError } = require("../modules/admin/http/traits/responseHandler");

const DEFAULT_MAX_LENGTH = 200;
const DEFAULT_MAX_TRIES = 50;

const generateSlug = (text, { maxLength = DEFAULT_MAX_LENGTH } = {}) => {
  if (text === undefined || text === null) return "";
  const base = slugify(String(text), { lower: true, strict: true, trim: true });
  return base.slice(0, maxLength).replace(/-+$/g, "");
};

// Case-insensitive lookup. Soft-deleted rows are excluded by default via
// the model's paranoid scope; pass `withDeleted: true` to include them.
// `scope` adds extra WHERE conditions (e.g. `{ attribute_id: 5 }`) so
// uniqueness can be limited to a parent record instead of being global.
const findDuplicate = async (
  Model,
  {
    field = "slug",
    value,
    excludeId,
    transaction,
    withDeleted = false,
    scope,
  } = {},
) => {
  const clean = value === undefined || value === null ? "" : String(value).trim();
  if (!clean) return null;

  const seq = Model.sequelize;
  const conditions = [
    seq.where(seq.fn("lower", seq.col(field)), clean.toLowerCase()),
  ];
  if (excludeId !== undefined && excludeId !== null) {
    conditions.push({ id: { [Op.ne]: Number(excludeId) } });
  }
  if (scope && Object.keys(scope).length > 0) {
    conditions.push(scope);
  }

  return Model.findOne({
    where: { [Op.and]: conditions },
    transaction,
    ...(withDeleted ? { paranoid: false } : {}),
  });
};

const isDuplicate = async (Model, options = {}) => {
  return !!(await findDuplicate(Model, options));
};

const assertNoDuplicate = async (Model, options = {}) => {
  const { field = "slug", value } = options;
  const existing = await findDuplicate(Model, options);
  if (!existing) return;

  const message = `This ${field} is already in use`;
  throw new CustomError(message, 409, "DUPLICATE_RESOURCE", [
    { field, message, value },
  ]);
};

const generateUniqueSlug = async (
  Model,
  sourceText,
  {
    field = "slug",
    excludeId,
    transaction,
    maxTries = DEFAULT_MAX_TRIES,
    scope,
  } = {},
) => {
  const base = generateSlug(sourceText);
  if (!base) return "";

  let candidate = base;
  let suffix = 1;
  while (suffix <= maxTries) {
    const exists = await findDuplicate(Model, {
      field,
      value: candidate,
      excludeId,
      transaction,
      scope,
    });
    if (!exists) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return `${base}-${Date.now()}`;
};

module.exports = {
  generateSlug,
  findDuplicate,
  isDuplicate,
  assertNoDuplicate,
  generateUniqueSlug,
};