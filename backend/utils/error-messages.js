const ERRORS = {
    COMMON: {
        MISSING_DATA: "errors:common.missingData",
        MISSING_IMAGE: "errors:common.missingImage",
        FILE_TOO_LARGE: "errors:common.fileTooLarge",
        FILE_UPLOAD_ERROR: "errors:common.fileUploadError",
        IMAGE_PROCESSING_ERROR: "errors:common.imageProcessingError",
        UNEXPECTED_ERROR: "errors:common.unexpectedError",
        INVALID_RESOLUTION: "errors:common.invalidResolution",
        FILE_NOT_FOUND: "errors:common.fileNotFound",
        INVALID_IMAGE_TYPE: "errors:common.invalidImageType",
        INVALID_PAGE: "errors:common.invalidPage",
        ENDPOINT_NOT_FOUND: "errors:common.endpointNotFound",
        PAGE_NOT_FOUND: "errors:common.pageNotFound"
    },

    GAMEMAP: {
        INVALID_ID: "errors:gamemap.invalidId",

        NO_ACCESS: "errors:gamemap.noAccess",
        COVER_IMAGE_UPDATE_FAILED: "errors:gamemap.coverImageUpdateFailed",
        COVER_IMAGE_DELETE_FAILED: "errors:gamemap.coverImageDeleteFailed",
        NOT_FOUND: "errors:gamemap.notFound",
        COVER_IMAGE_NOT_FOUND: "errors:gamemap.coverImageNotFound",
        UPDATE_FAILED: "errors:gamemap.updateFailed",
        DELETE_FAILED: "errors:gamemap.deleteFailed",

        TITLE: {
            INVALID_PATTERN: "errors:gamemap.title.invalidPattern",
            TOO_LONG: "errors:gamemap.title.tooLong",
            TOO_SHORT: "errors:gamemap.title.tooShort",
            EMPTY: "errors:gamemap.title.empty"
        },

        DESCRIPTION: {
            INVALID_PATTERN: "errors:gamemap.description.invalidPattern",
            TOO_LONG: "errors:gamemap.description.tooLong",
            TOO_SHORT: "errors:gamemap.description.tooShort",
            EMPTY: "errors:gamemap.description.empty"
        },

        ATLEAST_TITLE_OR_DESCRIPTION: "errors:gamemap.atleastTitleOrDescription",

        NO_MAPS: "errors:gamemap.noMaps",
        NO_POINTS: "errors:gamemap.noPoints"
    },

    MAP: {
        INVALID_ID: "errors:map.invalidId",

        NO_ACCESS: "errors:map.noAccess",
        NOT_FOUND: "errors:map.notFound",

        RENAME_FAILED: "errors:map.renameFailed",
        SAVE_FAILED: "errors:map.saveFailed",
        DELETE_FAILED: "errors:map.deleteFailed",
        IMAGE_DELETIONS_FAILED: "errors:map.imageDeletionsFailed",

        TITLE_EMPTY: "errors:map.titleEmpty",
        TITLE_TOO_LONG: "errors:map.titleTooLong",
        TITLE_INVALID_CHARS: "errors:map.titleInvalidChars"
    },

    POINT: {
        INVALID_ID: "errors:point.invalidId",

        NO_ACCESS: "errors:point.noAccess",
        NOT_FOUND: "errors:point.notFound",

        ALREADY_EXISTS: "errors:point.alreadyExists",

        COORDINATES_UPDATE_FAILED: "errors:point.coordinatesUpdateFailed",
        IMAGE_PATH_UPDATE_FAILED: "errors:point.imagePathUpdateFailed",
        OLD_IMAGE_DELETION_FAILED: "errors:point.oldImageDeletionFailed",
        IMAGE_DELETION_FAILED: "errors:point.imageDeletionFailed",
        DELETE_FAILED: "errors:point.deleteFailed",
        NORTH_DIRECTION_UPDATE_FAILED: "errors:point.northDirectionUpdateFailed",

        UV_INVALID_TYPE: "errors:point.uvInvalidType",
        UV_MIN_ERROR: "errors:point.uvMinError",
        UV_MAX_ERROR: "errors:point.uvMaxError",
        UV_REQUIRED: "errors:point.uvRequired",

        NORTH_DIRECTION_TYPE: "errors:point.northDirectionType",
        NORTH_DIRECTION_MIN: "errors:point.northDirectionMin",
        NORTH_DIRECTION_MAX: "errors:point.northDirectionMax",
        NORTH_DIRECTION_REQUIRED: "errors:point.northDirectionRequired"
    },

    CONNECTION: {
        INVALID_ID: "errors:connection.invalidId",
        INVALID_START_ID: "errors:connection.invalidStartId",
        INVALID_END_ID: "errors:connection.invalidEndId",

        NO_ACCESS: "errors:connection.noAccess",

        MISSING_DIRECTION_BODY: "errors:connection.missingDirectionBody",

        ALREADY_EXISTS: "errors:connection.alreadyExists",

        NOT_ON_SAME_GAME_MAP: "errors:connection.notOnSameGameMap",

        UPDATE_FAILED: "errors:connection.updateFailed",
        DELETE_FAILED: "errors:connection.deleteFailed",

        NOT_CROSSMAP: "errors:connection.notCrossmap",
        DIRECTION_NOT_GIVEN_FOR_CROSSMAP: "errors:connection.directionNotGivenForCrossmap",

        SAME_START_END: "errors:connection.sameStartEnd",
        END_MUST_BE_GREATER: "errors:connection.endMustBeGreater",

        START_TO_END_TYPE: "errors:connection.startToEndType",
        START_TO_END_MIN: "errors:connection.startToEndMin",
        START_TO_END_MAX: "errors:connection.startToEndMax",

        END_TO_START_TYPE: "errors:connection.endToStartType",
        END_TO_START_MIN: "errors:connection.endToStartMin",
        END_TO_START_MAX: "errors:connection.endToStartMax",

        ATLEAST_ONE_DIRECTION: "errors:connection.atleastOneDirection"
    },

    COMMENT: {
        TOO_LONG: "errors:comment.tooLong",
        EMPTY_CONTENT: "errors:comment.emptyContent",
        INVALID_CHARACTERS: "errors:comment.invalidCharacters",
        ALREADY_COMMENTED: "errors:comment.alreadyCommented",
        NOT_FOUND: "errors:comment.notFound",
        UPDATE_FAILED: "errors:comment.updateFailed",
        DELETE_FAILED: "errors:comment.deleteFailed",

        INVALID_RATING: "errors:comment.invalidRating",
        TOO_LOW_RATING: "errors:comment.tooLowRating",
        TOO_HIGH_RATING: "errors:comment.tooHighRating",
        RATING_REQUIRED: "errors:comment.ratingRequired"
    },

    FAVORITE: {
        ALREADY_FAVORITED: "errors:favorite.alreadyFavorited",
        NOT_FAVORITED: "errors:favorite.notFavorited",
        ADD_FAILED: "errors:favorite.addFailed",
        REMOVE_FAILED: "errors:favorite.removeFailed"
    },

    GAMEFLOW: {
        INVALID_OFFSET: "errors:gameflow.invalidOffset",
        INVALID_SORT: "errors:gameflow.invalidSort",
        FETCH_GAME_MAPS_FAILED: "errors:gameflow.fetchGameMapsFailed",
        FETCH_SESSION_FAILED: "errors:gameflow.fetchSessionFailed",
        FINISH_SESSION_FAILED: "errors:gameflow.finishSessionFailed",
        PROCESS_GUESS_FAILED: "errors:gameflow.processGuessFailed",
        FETCH_RANDOM_POINT_FAILED: "errors:gameflow.fetchRandomPointFailed",
        FETCH_MAPS_FAILED: "errors:gameflow.fetchMapsFailed",
        CHECK_SESSION_FAILED: "errors:gameflow.checkSessionFailed",
        CREATE_SESSION_FAILED: "errors:gameflow.createSessionFailed",
        NO_ACTIVE_POINT: "errors:gameflow.noActivePoint",
        INVALID_GUESS_COORDS: "errors:gameflow.invalidGuessCoords",
        NO_ACTIVE_ROUND: "errors:gameflow.noActiveRound",
        NO_POINTS_AVAILABLE: "errors:gameflow.noPointsAvailable",
        INVALID_ROUNDS: "errors:gameflow.invalidRounds",
        INVALID_ROUND_TIME: "errors:gameflow.invalidRoundTime"
    }
};

module.exports = ERRORS;
