#version 300 es

precision highp float;
precision highp int;

out vec4 outColor;
in vec2 vTex;

uniform int uUseTexture;
uniform sampler2D uTexture0;

void main() {
    vec3 baseColor;
    if(uUseTexture == 1) {
        baseColor = texture(uTexture0, vTex).rgb;
    } else {
        baseColor = uMatAlbedo;
    }
    outColor = vec4(baseColor, 1.0f);
}