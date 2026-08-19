const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  getCache,
  setCache,
  invalidateCache,
  cacheKeys,
} = require("../../traits/cacheHelper");
const {
  validateId,
  validationRequestPost,
} = require("../../request/home/homeCmsRequest");
const { validationResult } = require("express-validator");

class HomeCmsController {
  static async get(req, res) {
    try {
      const cached = await getCache(req, cacheKeys.homeCms());
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Home CMS retrieved successfully from cache",
        );
      }

      const data = await models.HomeCms.findOne();

      await setCache(req, cacheKeys.homeCms(), data);

      sendSuccessResponse(res, data, "Home CMS retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all(
      [...validateId, ...validationRequestPost].map((v) => v.run(req)),
    );
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendValidationError(res, errors.array());
    }

    try {
      let homeCms = await models.HomeCms.findOne();

      if (!homeCms) {
        homeCms = await models.HomeCms.create(req.body);
      } else {
        await homeCms.update(req.body);
      }
      await invalidateCache(req, cacheKeys.homeCms());

      sendSuccessResponse(res, homeCms, "Home CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = HomeCmsController;
