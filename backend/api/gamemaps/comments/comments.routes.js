const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateRequest } = require("#utils/validation.js");
const { upload } = require("#config/mapdatas-upload-config.js");
const schemas = require("#gamemaps/comments/comments.schemas.js");
const controller = require("#gamemaps/comments/comments.controller.js");

//?GET /api/game-maps/:gameMapID/comments
router.get(
    "/comments",
    validateRequest(schemas.getGameMapCommentsSchema),
    controller.getGameMapComments
);

//?GET /api/game-maps/:gameMapID/my-comment
router.get(
    "/my-comment",
    validateRequest(schemas.getUserCommentSchema),
    controller.getUserComment
);

//?POST /api/game-maps/:gameMapID/my-comment
router.post(
    "/my-comment",
    upload.none(),
    validateRequest(schemas.postGameMapCommentsSchema),
    controller.postGameMapComments
);

//?PUT /api/game-maps/:gameMapID/my-comment
router.put(
    "/my-comment",
    upload.none(),
    validateRequest(schemas.putUserCommentSchema),
    controller.updateUserComment
);

//?DELETE /api/game-maps/:gameMapID/my-comment
router.delete(
    "/my-comment",
    validateRequest(schemas.deleteUserCommentSchema),
    controller.deleteUserComment
);

module.exports = router;
