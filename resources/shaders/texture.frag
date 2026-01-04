#version 300 es
precision mediump float;

out vec4 outColor;
in vec2 vTex;

uniform sampler2D texture1;

void main() {
    outColor = texture(texture1, vTex);
}