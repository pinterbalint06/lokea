const AppError = require('#utils/app-error.js');
const ERRORS = require('#utils/error-messages.js');
const { buildErrorHtml } = require('#utils/error-template.js');

const notFoundHandler = (request, response, next) => {
    if (request.originalUrl.startsWith('/api')) {
        response.status(404).json({ error: request.t ? request.t(ERRORS.COMMON.ENDPOINT_NOT_FOUND) : ERRORS.COMMON.ENDPOINT_NOT_FOUND });
    } else {
        next(new AppError(ERRORS.COMMON.ENDPOINT_NOT_FOUND, 404));
    }
};

// global error handler
const globalErrorHandler = (error, request, response, next) => {
    const statusCode = error.statusCode || 500;
    const rawMessage = statusCode >= 500 ? ERRORS.COMMON.UNEXPECTED_ERROR : (error.message || ERRORS.COMMON.UNEXPECTED_ERROR);
    const message = request.t ? request.t(rawMessage) : rawMessage;

    if (statusCode >= 500) {
        console.error(`Unhandled Server Error: ${request.method} ${request.originalUrl}\n`, error);
    }

    if (!response.headersSent) {
        if (request.originalUrl.startsWith('/api')) {
            response.status(statusCode).json({
                error: message
            });
        } else {
            const finalHtml = buildErrorHtml(statusCode, message);
            response.status(statusCode).send(finalHtml);
        }
    } else {
        next(error);
    }
};

module.exports = {
    notFoundHandler,
    globalErrorHandler
};
