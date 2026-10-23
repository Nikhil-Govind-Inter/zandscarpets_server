const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./ProjectsDetailService");

class ProjectsDetailController {
  /*
   * @route   GET /api/frontend/projects/:slug
   * @desc    One active project (404 when missing or inactive)
   * @access  Public
   */
  static async detail(req, res) {
    try {
      const { data } = await service.detail(req);
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "projectsDetailController.detail");
    }
  }

  /*
   * @route   GET /api/frontend/projects/:slug/related?limit=6
   * @desc    Related projects for the "related projects" carousel
   * @access  Public
   */
  static async related(req, res) {
    try {
      const { data } = await service.related(req);
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "projectsDetailController.related");
    }
  }
}

module.exports = ProjectsDetailController;
