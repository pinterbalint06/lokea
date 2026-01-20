#version 300 es

#line 1 0

precision highp float;
precision highp int;

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoords;

uniform int uUseTexture;

out vec4 vPosition;
out vec3 vNormal;
out vec2 vTexCoords;

void main() {
    if(uUseTexture == 1) {
        vTexCoords = aTexCoords;
    }
    vPosition = uM * aPosition;
    vNormal = aNormal;
    gl_Position = uVP * vPosition;
}
