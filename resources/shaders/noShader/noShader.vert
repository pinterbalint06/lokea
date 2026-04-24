#version 300 es

#line 1 0

precision highp float;
precision highp int;

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec2 aTexCoords;

out vec2 vTex;

void main() {
    vTex = aTexCoords;
    gl_Position = uVP * uM * aPosition;
}
