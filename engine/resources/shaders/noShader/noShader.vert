#version 300 es

#line 1 0

precision highp float;
precision highp int;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec2 aTexCoords;
layout(location = 2) in vec2 aInstanceOffset;

out vec2 vTex;

void main() {
    vTex = aTexCoords;

    vec4 localPos = uModelMatrix * vec4(aPosition, 1.0);

    localPos.xy += aInstanceOffset;

    gl_Position = uVP * localPos;
}
