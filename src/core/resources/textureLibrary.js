mergeInto(LibraryManager.library, {
    textureFromURL: function (textureID, url, ctxId, onSuccessHandle, onErrorHandle) {
        let gl = GL.contexts[ctxId].GLctx;
        let img = new Image();
        let imgUrl = UTF8ToString(url);

        let onSuccess = Emval.toValue(onSuccessHandle);
        let onError = Emval.toValue(onErrorHandle);

        img.onload = function () {
            let texture = GL.textures[textureID];
            if (texture) {
                gl.bindTexture(gl.TEXTURE_2D, texture);

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
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
                    onError("Texture failed to load (it no longer exists):\t" + imgUrl);
                }
            }
        };

        img.onerror = function () {
            if (typeof onError == "function") {
                onError("Texture failed to load:\t" + imgUrl);
            }
        };

        img.src = imgUrl;
    }
});