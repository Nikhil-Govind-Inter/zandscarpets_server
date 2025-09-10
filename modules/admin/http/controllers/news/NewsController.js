const { validationResult } = require('express-validator');
const { sequelize, models } = require('../../../../../database/models');
const { sendValidationError, sendSuccessResponse, sendErrorResponse, sendNotFoundError } = require("../../traits/responseHandler");
const { validationRequestPost, validateId } = require("../../request/news/NewsRequest");
const { handleFileUploadStore, handleFileUploadUpdate } = require('../../middleware/multerMiddleware');
const { paginate } = require('../../../http/traits/datatablePaginationHelper');


const DataModel = models.News;

class NewsController {
    static async index(req, res) {
        try {
            const result = await paginate(DataModel, req, {
                order: [['sort_order', 'ASC'], ['createdAt', 'DESC']],
                searchFields: ['name', 'title', 'keywords'],
            });

            const response = {
                list: result.data,
                pagination: result.pagination
            };

            sendSuccessResponse(res, response, 'Data retrieved successfully');
        } catch (error) {
            console.error('Data index error:', error);
            sendErrorResponse(res, error);
        }
    }


    static async store(req, res) {
        await Promise.all(validationRequestPost.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, errors.array());
        }

        try {
            req.body.slug = slugify(req.body.name, { lower: true, strict: true });

            // Check for duplicate slug
            const existing = await DataModel.findOne({ where: { slug: req.body.slug }, paranoid: true });
            if (existing) {
                return sendErrorResponse(res, 'A data with this name already exists', null, 409);
            }
            const fileFields = ["thumbnail", "banner_media_desktop_path", "banner_media_mobile_path"];

            handleFileUploadStore(req, fileFields);
            // Create Data
            const data = await DataModel.create(req.body);

            // Fetch created data with associations
            const createdData = await DataModel.findByPk(data.id);

            sendSuccessResponse(res, createdData, 'Data created successfully', 201);

        } catch (error) {
            console.error('Data creation error:', error);
            sendErrorResponse(res, error);
        }
    }


    static async show(req, res) {
        // Run ID validation
        await Promise.all(validateId.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, errors.array());
        }

        try {
            const { id } = req.params;

            const data = await DataModel.findByPk(id);

            if (!data) {
                return sendNotFoundError(res, 'Data');
            }

            sendSuccessResponse(res, data, 'Data retrieved successfully');

        } catch (error) {
            console.error('Data show error:', error);
            sendErrorResponse(res, error);
        }
    }

    static async update(req, res) {
        // Run validations
        await Promise.all([...validateId, ...validationRequestPost].map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, errors.array());
        }

        try {
            const { id } = req.params;

            const data = await DataModel.findByPk(id);
            if (!data) {
                return sendNotFoundError(res, 'Data');
            }
            // Generate new slug if name is updated
            if (req.body.name && req.body.name !== data.name) {
                req.body.slug = slugify(req.body.name, { lower: true, strict: true });

                // Check for duplicate slug (excluding current record)
                const existing = await DataModel.findOne({
                    where: {
                        slug: req.body.slug,
                        id: { [Op.ne]: data.id }
                    },
                    paranoid: true
                });
                if (existing && existing.id !== data.id) {
                    return sendErrorResponse(res, 'A Data with this name already exists', null, 409);
                }
            }
            const fileFields = ["thumbnail", "banner_media_desktop_path", "banner_media_mobile_path"];
            await handleFileUploadUpdate(req, data, fileFields);
            console.log("second", req.body);
            // Update the data
            await data.update(req.body);

            // Fetch updated data with associations
            const updatedData = await DataModel.findByPk(data.id);

            sendSuccessResponse(res, updatedData, 'Data updated successfully');
        } catch (error) {
            console.error('Data update error:', error);
            sendErrorResponse(res, error);
        }
    }


    static async destroy(req, res) {
        // Run ID validation
        await Promise.all(validateId.map(validation => validation.run(req)));
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return sendValidationError(res, errors.array());
        }

        try {
            const { id } = req.params;

            const data = await DataModel.findByPk(id);
            if (!data) {
                return sendNotFoundError(res, 'Data');
            }

            // Soft delete
            await data.destroy();

            sendSuccessResponse(res, { id }, 'Data deleted successfully');

        } catch (error) {
            console.error('Data deletion error:', error);
            sendErrorResponse(res, error);
        }
    }


}

module.exports = NewsController;