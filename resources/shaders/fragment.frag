#version 300 es

precision mediump float;
in vec3 vNormal;
out vec4 outColor;

void main() {
    vec3 color = vec3(0.11f * vNormal.y, 0.62f * vNormal.y, 0.22f * vNormal.y);
    outColor = vec4(color, 1.0f);
}