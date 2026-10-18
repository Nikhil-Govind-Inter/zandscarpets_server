const { models } = require("../../../../../database/models");
const { handleFileUploadUpdate } = require("../../middleware/multerMiddleware");
const {
  sendErrorResponse,
  sendSuccessResponse,
  sendValidationError,
} = require("../../traits/responseHandler");
const {
  validateId,
  validationRequestPost,
} = require("../../request/contact/contactCmsRequest");
const { extractMapEmbedUrl } = require("../../../../../utils/googleMapsEmbed");
const { validationResult } = require("express-validator");

const fileFields = ["phone_icon_media_path", "email_icon_media_path", "office_icon_media_path"];

class ContactCmsController {
  static async get(req, res) {
    try {
      const data = await models.ContactCms.findOne();
      sendSuccessResponse(res, data, "Contact CMS retrieved successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }

  static async update(req, res) {
    await Promise.all([...validateId, ...validationRequestPost].map((v) => v.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) return sendValidationError(res, errors.array());

    // store only the clean embed URL, whatever snippet was pasted
    req.body.map_url = extractMapEmbedUrl(req.body.map_url);

    try {
      let contactCms = await models.ContactCms.findOne();
      await handleFileUploadUpdate(req, contactCms, fileFields);
      if (!contactCms) {
        contactCms = await models.ContactCms.create(req.body);
      } else {
        await contactCms.update(req.body);
      }
      sendSuccessResponse(res, contactCms, "Contact CMS updated successfully");
    } catch (error) {
      return sendErrorResponse(res, error);
    }
  }
}

module.exports = ContactCmsController;
