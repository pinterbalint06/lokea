#version 300 es

precision highp float;
precision highp int;

in vec4 vColor;
out vec4 outColor;

void main() {
    outColor = vColor;
}