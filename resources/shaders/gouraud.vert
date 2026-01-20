#version 300 es

#line 1 0

precision highp float;
precision highp int;

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoords;

uniform int uUseTexture;
uniform sampler2D uAlbedo;

uniform int uIsTerrain;

out vec4 vColor;

void main() {
    vec3 baseColor;
    if(uUseTexture == 1) {
        baseColor = texture(uAlbedo, aTexCoords).rgb;
    } else {
        baseColor = uMatAlbedo;
    }
    vec4 worldPos = uM * aPosition;
    vColor = phongReflectionModel(aNormal, worldPos.xyz, uCamPos, uLightVec, uLightColorPreCalc, uLightColor, uAmbientLight, baseColor, uMatDiffuseness, uMatSpecularity, uMatShininess);
    gl_Position = uVP * worldPos;
}
