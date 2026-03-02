mergeInto(LibraryManager.library, {
    $handleError: function (onError, msg) {
        if (typeof onError == "function") {
            onError(msg);
        } else {
            console.error(msg);
        }
    },
    textureFromURL: function (textureID, url, ctxId, onSuccessHandle, onErrorHandle) {
        let gl = GL.contexts[ctxId].GLctx;
        let imgUrl = UTF8ToString(url);

        let onSuccess = Emval.toValue(onSuccessHandle);
        let onError = Emval.toValue(onErrorHandle);

        fetch(imgUrl)
            .then(function (response) {
                if (response.ok) {
                    let contentType = response.headers.get("content-type");
                    if (contentType && !contentType.startsWith("image/")) {
                        handleError(onError, "Invalid content-type:\t" + contentType);
                    }
                    return response.blob();
                }
            })
            .then(function (blob) {
                return createImageBitmap(blob);
            })
            .then(function (imageBitmap) {
                let texture = GL.textures[textureID];
                if (texture) {
                    gl.bindTexture(gl.TEXTURE_2D, texture);

                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBitmap);
                    gl.generateMipmap(gl.TEXTURE_2D);

                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

                    gl.bindTexture(gl.TEXTURE_2D, null);
                    if (typeof onSuccess == "function") {
                        onSuccess();
                    }
                }
                else {
                    if (typeof onError == "function") {
                        handleError(onError, "Texture failed to load (it no longer exists):\t" + imgUrl);
                    }
                }
            })
            .catch(function (eror) {
                handleError(onError, "Texture failed to load (Fetch/decoding error):\t" + imgUrl);
            });
    },
    textureFromURL__deps: ["$handleError"]
});