mergeInto(LibraryManager.library, {
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
        let onError = Emval.toValue(onErrorHandle);
        let imgUrl = UTF8ToString(url);
        let glContainer = GL.contexts[ctxId];
        if (glContainer) {
            let glContext = glContainer.GLctx;
            let onSuccess = Emval.toValue(onSuccessHandle);

            let img = new Image();
            let textureIds = Emval.toValue(textureIdsHandle);

            img.onload = function () {
                let tileCount = tiles * tiles;
                let textures = [];
                let textureCount = 0;
                while (textureCount < tileCount && GL.textures[textureIds[textureCount]]) {
                    textures.push(GL.textures[textureIds[textureCount]]);
                    textureCount++;
                }
                let currentRequestId = HEAP32[pointerCurrentRequestId / 4];
                if (textureCount == tileCount && requestID == currentRequestId) {
                    let tileWidth = img.width / tiles;
                    let tileHeight = img.height / tiles;
                    EquirectangularSharedCanvas.updateCanvas(tileWidth, tileHeight);
                    let canvas = EquirectangularSharedCanvas.canvas;
                    let canvasContext = EquirectangularSharedCanvas.canvasContext;
                    let i = 0;
                    for (let x = 0; x < tiles; x++) {
                        for (let y = 0; y < tiles; y++) {
                            canvasContext.clearRect(0, 0, tileWidth, tileHeight);
                            canvasContext.drawImage(img, x * tileWidth, y * tileHeight, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight);

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
                        onSuccess();
                    }
                }
                else {
                    if (textureCount != tileCount) {
                        if (typeof onError == "function") {
                            onError("Texture failed to load (it no longer exists):\t" + imgUrl);
                        } else {
                            console.error("Texture failed to load (it no longer exists):\t" + imgUrl);
                        }
                    } else {
                        if (typeof onError == "function") {
                            onError("New image was requested. Aborting old request." + imgUrl);
                        } else {
                            console.error("New image was requested. Aborting old request." + imgUrl);
                        }
                    }
                }
            };

            img.onerror = function () {
                if (typeof onError == "function") {
                    onError("Texture failed to load:\t" + imgUrl);
                } else {
                    console.error("Texture failed to load:\t" + imgUrl);
                }
            };

            img.src = imgUrl;
        } else {
            if (typeof onError == "function") {
                onError("Texture failed to load (invalid WebGL context):\t" + imgUrl);
            } else {
                console.error("Texture failed to load (invalid WebGL context):\t" + imgUrl);
            }
        }
    },
    equirectangularFromURL__deps: ['$EquirectangularSharedCanvas'],
});