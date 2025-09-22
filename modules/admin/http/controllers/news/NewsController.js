const { validationResult } = require('express-validator');
const { sequelize, models } = require('../../../../../database/models');
const { sendValidationError, sendSuccessResponse, sendErrorResponse, sendNotFoundError } = require("../../traits/responseHandler");
const { validationRequestPost, validateId } = require("../../request/news/NewsRequest");
const { handleFileUploadStore, handleFileUploadUpdate } = require('../../middleware/multerMiddleware');
const { paginate } = require('../../../http/traits/datatablePaginationHelper');
const slugify = require("slugify");
const { Op } = require("sequelize");


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
            if (!req.body.title || req.body.title.trim() === "") {
                return sendErrorResponse(res, "Title is required to generate slug", null, 400);
            }

            let baseSlug = slugify(req.body.title.trim(), { lower: true, strict: true });

            if (!baseSlug) {
                return sendErrorResponse(res, "Invalid title - cannot generate slug", null, 400);
            }

            // Generate unique slug
            let uniqueSlug = baseSlug;
            let counter = 1;
            let existingRecord = null;

            while (true) {
                existingRecord = await DataModel.findOne({
                    where: { slug: uniqueSlug },
                    paranoid: true
                });

                if (!existingRecord) {
                    break;
                }

                // Show which record already has this slug
                if (counter === 1) {
                    return sendErrorResponse(
                        res,
                        `Slug "${uniqueSlug}" already exists for record with ID: ${existingRecord.id}. Generated unique slug: "${baseSlug}-${counter}"`,
                        {
                            conflicting_record_id: existingRecord.id,
                            conflicting_slug: uniqueSlug,
                            suggested_slug: `${baseSlug}-${counter}`
                        },
                        409
                    );
                }

                uniqueSlug = `${baseSlug}-${counter}`;
                counter++;

                if (counter > 100) {
                    return sendErrorResponse(res, "Unable to generate unique slug", null, 500);
                }
            }

            req.body.slug = uniqueSlug;

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
                return sendNotFoundError(res, "Data");
            }

            // Generate new slug if title is updated
            if (req.body.title && req.body.title !== data.title) {
                if (req.body.title.trim() === "") {
                    return sendErrorResponse(res, "Title cannot be empty", null, 400);
                }

                let baseSlug = slugify(req.body.title.trim(), { lower: true, strict: true });

                if (!baseSlug) {
                    return sendErrorResponse(res, "Invalid title - cannot generate slug", null, 400);
                }

                // Generate unique slug
                let uniqueSlug = baseSlug;
                let counter = 1;
                let existingRecord = null;

                while (true) {
                    existingRecord = await DataModel.findOne({
                        where: {
                            slug: uniqueSlug,
                            id: { [Op.ne]: data.id },
                        },
                        paranoid: true,
                    });

                    if (!existingRecord) {
                        break;
                    }

                    // Show which record already has this slug
                    if (counter === 1) {
                        return sendErrorResponse(
                            res,
                            `Slug "${uniqueSlug}" already exists for record with ID: ${existingRecord.id}. Generated unique slug: "${baseSlug}-${counter}"`,
                            {
                                conflicting_record_id: existingRecord.id,
                                conflicting_slug: uniqueSlug,
                                suggested_slug: `${baseSlug}-${counter}`
                            },
                            409
                        );
                    }

                    uniqueSlug = `${baseSlug}-${counter}`;
                    counter++;

                    if (counter > 100) {
                        return sendErrorResponse(res, "Unable to generate unique slug", null, 500);
                    }
                }

                req.body.slug = uniqueSlug;
            }

            const fileFields = ["thumbnail", "banner_media_desktop_path", "banner_media_mobile_path"];
            await handleFileUploadUpdate(req, data, fileFields);

            // Update the data
            await data.update(req.body);

            // Fetch updated data with associations
            const updatedData = await DataModel.findByPk(data.id);

            sendSuccessResponse(res, updatedData, "Data updated successfully");
        } catch (error) {
            console.error("Data update error:", error);
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