
const { ApiResponse } = require("../traits/response");
const { HTTP_STATUS, RESPONSE_MESSAGES } = require("../traits/constants");
const { ErrorHandler } = require("../traits/errorHandler");
const service = require("../services/InvestInGoEcService");
class InvestInGoEcContoller {

    static async index(req, res) {
        try {
            const data = await service.index();
            return ApiResponse.success(res, {
                message: RESPONSE_MESSAGES.SUCCESS.DATA_RETRIEVED,
                data,
                status: HTTP_STATUS.OK,
            });
        } catch (error) {
            return ErrorHandler.handleControllerError(error, res, "InvestController");
        }
    }
}

module.exports = InvestInGoEcContoller;