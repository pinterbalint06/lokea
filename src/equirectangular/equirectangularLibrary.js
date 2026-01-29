mergeInto(LibraryManager.library, {
    equirectangularFromURL: function (url, ctxId, tiles, textureIdsHandle, onSuccessHandle, onErrorHandle) {
        let gl = GL.contexts[ctxId].GLctx;
        let img = new Image();
        let imgUrl = UTF8ToString(url);
        let textureIds = Emval.toValue(textureIdsHandle);

        let onSuccess = Emval.toValue(onSuccessHandle);
        let onError = Emval.toValue(onErrorHandle);

        img.onload = function () {
            let textureCount = tiles * tiles;
            let textures = [];
            let i = 0;
            while (i < textureCount && GL.textures[textureIds[i]]) {
                textures.push(GL.textures[textureIds[i]]);
                i++;
            }
            if (i == textureCount) {
                let canvas = document.createElement('canvas');
                let ctx = canvas.getContext('2d');
                let tileW = img.width / tiles;
                let tileH = img.height / tiles;
                canvas.width = tileW;
                canvas.height = tileH;
                let i = 0;
                for (let x = 0; x < tiles; x++) {
                    for (let y = 0; y < tiles; y++) {
                        ctx.clearRect(0, 0, tileW, tileH);
                        ctx.drawImage(img, x * tileW, y * tileH, tileW, tileH, 0, 0, tileW, tileH);

                        gl.bindTexture(gl.TEXTURE_2D, textures[i]);

                        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
                        gl.generateMipmap(gl.TEXTURE_2D);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                        gl.bindTexture(gl.TEXTURE_2D, null);
                        i++;
                    }
                }
                if (typeof onSuccess == "function") {
                    onSuccess();
                }
            }
            else {
                console.error("Texture failed to load (it no longer exists):\t" + imgUrl);
                if (typeof onError == "function") {
                    onError();
                }
            }
        };

        img.onerror = function () {
            console.error("Texture failed to load:\t" + imgUrl);
            if (typeof onError == "function") {
                onError();
            }
        };

        img.src = imgUrl;
    }
});