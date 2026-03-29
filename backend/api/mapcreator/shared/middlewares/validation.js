const AppError = require("../../../../utils/AppError.js");
const { deleteFile } = require("../../../../utils/fileUtils.js");

const validateRequest = (schema) => async (request, response, next) => {
    try {
        if (schema.body) {
            request.body = await schema.body.validateAsync(
                request.body,
                {
                    abortEarly: true,
                    stripUnknown: true,
                    convert: true
                }
            );
        }
        if (schema.params) {
            request.params = await schema.params.validateAsync(
                request.params,
                {
                    abortEarly: true,
                    stripUnknown: true,
                    convert: true
                }
            );
        }
        next();
    } catch (error) {
        if (request.file && request.file.path) {
            try {
                await deleteFile(request.file.path);
            } catch (deleteErr) {
                console.error("Error deleting temporary uploaded file:", deleteErr);
            }
        }

        next(new AppError(error.details[0].message, 400));
    }
};

module.exports = {
    validateRequest
};