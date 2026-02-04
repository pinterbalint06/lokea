mergeInto(LibraryManager.library, {
    $equirectangularReportError: function (onError, errorMessage, errorType, url, requestId, originalError = null) {
        let error = {
            "message": errorMessage,
            "options": {
                "type": errorType,
                "imgUrl": url,
                "requestId": requestId
            }
        };
        if (originalError) {
            error["options"]["originalError"] = originalError;
        }
        if (typeof onError == "function") {
            onError(error);
        } else {
            console.error("ERROR " + error.type + ": " + error.message, error.originalError);
        }
    },

    $getValidTextures: function (requiredTextureCount, textureIds) {
        let textures = [];
        let i = 0;
        while (i < requiredTextureCount && GL.textures[textureIds[i]]) {
            textures.push(GL.textures[textureIds[i]]);
            i++;
        }
        return textures;
    },

    equirectangularFromURL: function (
        url,
        ctxId,
        tiles,
        textureIdsHandle,
        onSuccessHandle,
        onErrorHandle,
        requestID,
        pointerCurrentRequestId
    ) {
        let imgUrl = UTF8ToString(url);
        let glContainer = GL.contexts[ctxId];
        let onError = Emval.toValue(onErrorHandle);
        if (glContainer) {
            let glContext = glContainer.GLctx;
            let onSuccess = Emval.toValue(onSuccessHandle);

            let textureIds = Emval.toValue(textureIdsHandle);

            fetch(imgUrl)
                .then(function (response) {
                    if (response.ok) {
                        let contentType = response.headers.get("content-type");
                        if (contentType && !contentType.startsWith("image/")) {
                            equirectangularReportError(onError, "Invalid content-type:\t" + contentType, "INVALID_INPUT", url, requestID);
                        }
                        return response.blob();
                    } else {
                        equirectangularReportError(onError, "Image failed to load:\t" + response.status, "NETWORK", url, requestID);
                    }
                })
                .then(function (blob) {
                    return createImageBitmap(blob);
                })
                .then(async function (imageBitmap) {
                    let tileCount = tiles * tiles;
                    let textures = getValidTextures(tileCount, textureIds);

                    let currentRequestId = HEAP32[pointerCurrentRequestId / 4];
                    if (textures.length == tileCount && requestID == currentRequestId) {
                        let tileWidth = imageBitmap.width / tiles;
                        let tileHeight = imageBitmap.height / tiles;
                        let maxSize = glContext.getParameter(glContext.MAX_TEXTURE_SIZE);
                        if (tileWidth <= maxSize && tileHeight <= maxSize) {

                            try {
                                let tileCreationPromises = [];
                                for (let x = 0; x < tiles; x++) {
                                    for (let y = 0; y < tiles; y++) {
                                        tileCreationPromises.push(
                                            createImageBitmap(imageBitmap, x * tileWidth, y * tileWidth, tileWidth, tileHeight)
                                        );
                                    }
                                }

                                let bitmapTiles = await Promise.all(tileCreationPromises);
                                imageBitmap.close()
                                for (let i = 0; i < bitmapTiles.length; i++) {
                                    glContext.bindTexture(glContext.TEXTURE_2D, textures[i]);
                                    glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, bitmapTiles[i]);

                                    if (tileCount == 1) {
                                        glContext.generateMipmap(glContext.TEXTURE_2D);
                                    }

                                    // if there is more than tile we disable linear interpolation
                                    // to prevent misalignment of the textures across tiles
                                    let minFilter = tileCount == 1 ? glContext.LINEAR_MIPMAP_LINEAR : glContext.LINEAR;
                                    let magFilter = tileCount == 1 ? glContext.LINEAR : glContext.NEAREST;
                                    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, minFilter);
                                    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, magFilter);

                                    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
                                    glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

                                    bitmapTiles[i].close();
                                }

                                glContext.bindTexture(glContext.TEXTURE_2D, null);
                            } catch (error) {
                                imageBitmap.close()
                                equirectangularReportError(onError, "Failed to upload texture to GPU", "WEBGL", imgUrl, requestID, error);
                            }
                            imageBitmap.close()

                            if (typeof onSuccess == "function") {
                                onSuccess();
                            }
                        } else {
                            imageBitmap.close()
                            equirectangularReportError(onError, "Texture doesn't fit in MAX_TEXTURE_SIZE (" + maxSize + ")", "WEBGL", imgUrl, requestID);
                        }
                    }
                    else {
                        imageBitmap.close()
                        if (textures.length != tileCount) {
                            equirectangularReportError(onError, "Textures no longer exist", "WEBGL", imgUrl, requestID);
                        } else {
                            equirectangularReportError(onError, "New image was requested. Aborting old request", "REQUEST_CANCELLED", imgUrl, requestID);
                        }
                    }
                })
                .catch(function (err) {
                    let msg = "Texture failed to load (Fetch/decoding error)";
                    equirectangularReportError(onError, msg, "IMAGE_DECODE", imgUrl, requestID);
                });
        } else {
            equirectangularReportError(onError, "Invalid WebGL context", "WEBGL", imgUrl, requestID);
        }
    },
    equirectangularFromURL__deps: ["$equirectangularReportError", "$getValidTextures"]
});