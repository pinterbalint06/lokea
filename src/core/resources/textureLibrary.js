mergeInto(LibraryManager.library, {
    $handleError: function (onError, msg) {
        if (typeof onError == "function") {
            onError(msg);
        } else {
            console.error(msg);
        }
    },
    /**
     * Fetches an image from a URL, decodes it, and uploads it to a WebGL texture.
     * 
     * @param {number} textureId - The identifier/handle for the WebGL texture.
     * @param {number} urlPointer - Pointer to the C-string containing the image URL.
     * @param {number} webglContextId - The identifier for the current WebGL context.
     * @param {boolean} shouldGenerateMipmaps - Whether to generate mipmaps after uploading.
     * @param {number} onSuccessHandle - Emscripten handle for the success callback function.
     * @param {number} onErrorHandle - Emscripten handle for the error callback function. */
    textureFromURL: async function (
        textureId,
        urlPointer,
        webglContextId,
        shouldGenerateMipmaps,
        onSuccessHandle,
        onErrorHandle
    ) {
        const glContext = GL.contexts[webglContextId].GLctx;
        const imageUrl = UTF8ToString(urlPointer);

        const onSuccessCallback = Emval.toValue(onSuccessHandle);
        const onErrorCallback = Emval.toValue(onErrorHandle);

        let imageBitmap = null;

        try {
            const response = await fetch(imageUrl);

            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && !contentType.startsWith("image/")) {
                throw new Error(`Invalid content-type: ${contentType}`);
            }

            const imageBlob = await response.blob();
            imageBitmap = await createImageBitmap(imageBlob);

            const webglTexture = GL.textures[textureId];

            if (!webglTexture) {
                throw new Error("Texture failed to load (the webgl texture no longer exists)");
            }

            glContext.bindTexture(glContext.TEXTURE_2D, webglTexture);
            glContext.texImage2D(glContext.TEXTURE_2D, 0, glContext.RGBA, glContext.RGBA, glContext.UNSIGNED_BYTE, imageBitmap);

            if (shouldGenerateMipmaps) {
                glContext.generateMipmap(glContext.TEXTURE_2D);
            }

            glContext.bindTexture(glContext.TEXTURE_2D, null);
            if (typeof onSuccessCallback == "function") {
                onSuccessCallback();
            }
        }
        catch (error) {
            handleError(onErrorCallback, `Texture error [${imageUrl}]: ${error.message}`);
        } finally {
            if (imageBitmap) {
                imageBitmap.close();
            }
        }
    },
    textureFromURL__deps: ["$handleError"]
});