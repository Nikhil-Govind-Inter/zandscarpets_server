const { ApiResponse } = require("../../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../../traits/constants");
const { ErrorHandler } = require("../../traits/errorHandler");
const service = require("./ProjectsListService");

class ProjectsListController {
  /*
   * @route   GET /api/frontend/projects
   * @desc    Paginated list of active projects (optionally filtered by industry slug)
   * @access  Public
   */
  static async index(req, res) {
    try {
      const { data } = await service.index(req);
      return ApiResponse.success(res, {
        message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
        data,
        status: HTTP_STATUS.OK,
      });
    } catch (error) {
      return ErrorHandler.handleControllerError(error, res, "projectsListController");
    }
  }
}

module.exports = ProjectsListController;
