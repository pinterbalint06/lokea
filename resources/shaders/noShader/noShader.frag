#version 300 es

#line 1 0

precision highp float;
precision highp int;

out vec4 outColor;
in vec2 vTex;

uniform int uUseTexture;
uniform sampler2D uAlbedo;

void main() {
    vec4 baseColor;
    if(uUseTexture == 1) {
        baseColor = texture(uAlbedo, vTex);
    } else {
        baseColor = vec4(uMatAlbedo, 1.0);
    }
    outColor = baseColor;
}