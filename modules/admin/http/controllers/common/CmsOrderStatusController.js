const { models } = require("../../../../../database/models");
const { cmsResources } = require("../../traits/cmsResources");
const {
  sendSuccessResponse,
  sendErrorResponse,
  sendNotFoundError,
  sendValidationError,
} = require("../../traits/responseHandler");
const { invalidateCache } = require("../../traits/cacheHelper");
const { validationResult, body, param } = require("express-validator");

const baseValidators = [
  param("resource")
    .custom((value) => Object.prototype.hasOwnProperty.call(cmsResources, value))
    .withMessage("Unknown resource"),
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer").toInt(),
];

const statusValidators = [
  ...baseValidators,
  body("is_active").isBoolean({ strict: true }).withMessage("is_active must be a boolean"),
];

const sortOrderValidators = [
  ...baseValidators,
  param("resource")
    .custom((value) => cmsResources[value]?.sortable !== false)
    .withMessage("Resource does not support sort order"),
  body("sort_order")
    .isInt({ min: 1, max: 32767 })
    .withMessage("sort_order must be an integer between 1 and 32767")
    .toInt(),
];

// Shared flow: validate -> find -> update a single field -> bust caches.
const updateField = (validators, field, label) => async (req, res) => {
  try {
    await Promise.all(validators.map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    const { resource, id } = req.params;
    const config = cmsResources[resource];
    const item = await models[config.model].findByPk(id);
    if (!item) return sendNotFoundError(res, resource);

    await item.update({ [field]: req.body[field] });

    await invalidateCache(req, `admin:cache:${config.cachePrefix}:*`);
    for (const pattern of config.frontend || []) {
      await invalidateCache(req, pattern);
    }

    return sendSuccessResponse(res, { id: item.id, [field]: item[field] }, `${label} updated successfully`);
  } catch (error) {
    console.error(`Error updating ${field}:`, error);
    return sendErrorResponse(res, error);
  }
};

module.exports = {
  updateStatus: updateField(statusValidators, "is_active", "Status"),
  updateSortOrder: updateField(sortOrderValidators, "sort_order", "Sort order"),
};
