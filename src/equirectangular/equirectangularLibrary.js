mergeInto(LibraryManager.library, {
    $equirectangularReportError: function (onError, sentError) {
        if (typeof onError == "function") {
            onError(sentError);
        } else {
            console.error(sentError);
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

    $EquirectangularSharedCanvas: {
        canvas: null,
        canvasContext: null,
        updateCanvas: function (width, height) {
            if (!EquirectangularSharedCanvas.canvas) {
                EquirectangularSharedCanvas.canvas = new OffscreenCanvas(width, height);
                EquirectangularSharedCanvas.canvasContext = EquirectangularSharedCanvas.canvas.getContext('2d', { alpha: false });
            }

            if (EquirectangularSharedCanvas.canvas.width != width || EquirectangularSharedCanvas.canvas.height != height) {
                EquirectangularSharedCanvas.canvas.width = width;
                EquirectangularSharedCanvas.canvas.height = height;
            }
        }
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

            let now = performance.now();
            fetch(imgUrl)
                .then(function (response) {
                    if (!response.ok) {
                        equirectangularReportError(onError, "Requested image failed to load:\t" + response.status);
                    }
                    return response.blob();
                })
                .then(function (blob) {
                    return createImageBitmap(blob);
                })
                .then(function (imageBitmap) {
                    let tileCount = tiles * tiles;
                    let textures = getValidTextures(tileCount, textureIds);

                    let currentRequestId = HEAP32[pointerCurrentRequestId / 4];
                    if (textures.length == tileCount && requestID == currentRequestId) {
                        let tileWidth = imageBitmap.width / tiles;
                        let tileHeight = imageBitmap.height / tiles;
                        EquirectangularSharedCanvas.updateCanvas(tileWidth, tileHeight);
                        let canvas = EquirectangularSharedCanvas.canvas;
                        let canvasContext = EquirectangularSharedCanvas.canvasContext;
                        let i = 0;
                        for (let x = 0; x < tiles; x++) {
                            for (let y = 0; y < tiles; y++) {
                                canvasContext.clearRect(0, 0, tileWidth, tileHeight);
                                canvasContext.drawImage(imageBitmap, x * tileWidth, y * tileHeight, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);

                                glContext.bindTexture(glContext.TEXTURE_2D, textures[i]);

                                glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, canvas);

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

                                i++;
                            }
                        }
                        glContext.bindTexture(glContext.TEXTURE_2D, null);
                        if (typeof onSuccess == "function") {
                            console.log("ttok", performance.now() - now);
                            onSuccess();
                        }
                    }
                    else {
                        if (textures.length != tileCount) {
                            equirectangularReportError(onError, "Texture failed to load (it no longer exists):\t" + imgUrl);
                        } else {
                            equirectangularReportError(onError, "New image was requested. Aborting old request:\t" + imgUrl);
                        }
                    }
                })
                .catch(function (err) {
                    let msg = "Texture failed to load (Fetch/decoding error): " + err.message + "\t" + imgUrl;
                    equirectangularReportError(onError, msg);
                });
        } else {
            equirectangularReportError(onError, "Texture failed to load (invalid WebGL context):\t" + imgUrl);
        }
    },
    equirectangularFromURL__deps: ["$EquirectangularSharedCanvas", "$equirectangularReportError", "$getValidTextures"]
});