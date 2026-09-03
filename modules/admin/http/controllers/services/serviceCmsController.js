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
} = require("../../request/services/serviceCms.js");
const { validationResult } = require("express-validator");


const dataModel = models.ServiceCms;

class ServiceCmsController {

  static async get(req, res) {
    try {
      const cached = await getCache(req, cacheKeys.serviceCms());
      if (cached) {
        return sendSuccessResponse(
          res,
          cached,
          "Service CMS retrieved successfully from cache",
        );
      }

      const data = await dataModel.findOne();

      await setCache(req, cacheKeys.serviceCms(), data);

      sendSuccessResponse(res, data, "Service CMS retrieved successfully");
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
      let serviceCms = await dataModel.findOne();

      if (!serviceCms) {
        serviceCms = await dataModel.create(req.body);
      } else {
        await serviceCms.update(req.body);
      }
      await invalidateCache(req, cacheKeys.serviceCms());

      sendSuccessResponse(res, serviceCms, "Service CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ServiceCmsController;
