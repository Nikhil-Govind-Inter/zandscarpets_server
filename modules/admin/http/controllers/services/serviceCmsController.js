const { models } = require("../../../../../database/models");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  validateId,
  validationRequestPost,
} = require("../../request/services/serviceCmsRequest.js");
const { validationResult } = require("express-validator");

const dataModel = models.ServiceCms;

class ServiceCmsController {

  static async get(req, res) {
    try {
      const data = await dataModel.findOne();

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

      sendSuccessResponse(res, serviceCms, "Service CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ServiceCmsController;
