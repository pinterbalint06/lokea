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

    equirectangularFromURL: async function (
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

            let imageBitmap = null;
            let bitmapTiles = [];

            try {
                let response = await fetch(imgUrl);

                if (response.ok) {
                    let contentType = response.headers.get("content-type");

                    if (contentType && !contentType.startsWith("image/")) {
                        equirectangularReportError(onError, "Invalid content-type:\t" + contentType, "INVALID_INPUT", imgUrl, requestID);
                    } else {
                        let blob = await response.blob();
                        imageBitmap = await createImageBitmap(blob);

                        let tileCount = tiles * tiles;
                        let textures = getValidTextures(tileCount, textureIds);
                        let currentRequestId = HEAP32[pointerCurrentRequestId >> 2];

                        if (textures.length == tileCount && requestID == currentRequestId) {
                            let tileWidth = Math.floor(imageBitmap.width / tiles);
                            let tileHeight = Math.floor(imageBitmap.height / tiles);
                            let maxSize = glContext.getParameter(glContext.MAX_TEXTURE_SIZE);

                            if (tileWidth <= maxSize && tileHeight <= maxSize) {
                                try {
                                    let tileCreationPromises = [];
                                    for (let x = 0; x < tiles; x++) {
                                        for (let y = 0; y < tiles; y++) {
                                            tileCreationPromises.push(
                                                createImageBitmap(imageBitmap, x * tileWidth, y * tileHeight, tileWidth, tileHeight)
                                            );
                                        }
                                    }

                                    bitmapTiles = await Promise.all(tileCreationPromises);

                                    for (let i = 0; i < bitmapTiles.length; i++) {
                                        glContext.bindTexture(glContext.TEXTURE_2D, textures[i]);
                                        glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, bitmapTiles[i]);

                                        if (tileCount == 1) {
                                            glContext.generateMipmap(glContext.TEXTURE_2D);
                                        }

                                        // if there is more than one tile we disable linear interpolation
                                        // to prevent misalignment of the texture with linear interpolation
                                        let minFilter = tileCount == 1 ? glContext.LINEAR_MIPMAP_LINEAR : glContext.LINEAR;
                                        let magFilter = glContext.LINEAR;
                                        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MIN_FILTER, minFilter);
                                        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_MAG_FILTER, magFilter);

                                        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_S, glContext.CLAMP_TO_EDGE);
                                        glContext.texParameteri(glContext.TEXTURE_2D, glContext.TEXTURE_WRAP_T, glContext.CLAMP_TO_EDGE);

                                        bitmapTiles[i].close();
                                        bitmapTiles[i] = null;
                                    }

                                    glContext.bindTexture(glContext.TEXTURE_2D, null);

                                    if (typeof onSuccess == "function") {
                                        onSuccess();
                                    }
                                } catch (error) {
                                    equirectangularReportError(onError, "Failed to upload texture to GPU", "WEBGL", imgUrl, requestID, error);
                                }
                            } else {
                                equirectangularReportError(onError, "Texture doesn't fit in MAX_TEXTURE_SIZE (" + maxSize + ")", "WEBGL", imgUrl, requestID);
                            }
                        } else {
                            if (textures.length != tileCount) {
                                equirectangularReportError(onError, "Textures no longer exist", "WEBGL", imgUrl, requestID);
                            } else {
                                equirectangularReportError(onError, "New image was requested. Aborting old request", "REQUEST_CANCELLED", imgUrl, requestID);
                            }
                        }
                    }
                } else {
                    equirectangularReportError(onError, "Image failed to load:\t" + response.status, "NETWORK", imgUrl, requestID);
                }
            } catch (error) {
                let msg = "Texture failed to load (Fetch/decoding error)";
                equirectangularReportError(onError, msg, "IMAGE_DECODE", imgUrl, requestID, error);
            } finally {
                if (imageBitmap) {
                    imageBitmap.close();
                }
                for (let i = 0; i < bitmapTiles.length; i++) {
                    if (bitmapTiles[i]) {
                        bitmapTiles[i].close();
                    }
                }
            }
        } else {
            equirectangularReportError(onError, "Invalid WebGL context", "WEBGL", imgUrl, requestID);
        }
    },
    equirectangularFromURL__deps: ["$equirectangularReportError", "$getValidTextures"]
});
