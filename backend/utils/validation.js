const AppError = require("#utils/app-error.js");
const { deleteFile } = require("#utils/file-utils.js");

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
        if (schema.query) {
            const validatedQuery = await schema.query.validateAsync(
                request.query,
                {
                    abortEarly: true,
                    stripUnknown: true,
                    convert: true
                }
            );
            request.query = validatedQuery;
            request.validatedQuery = validatedQuery;
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
