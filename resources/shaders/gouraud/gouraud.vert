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
    vec4 baseColor;
    if(uUseTexture == 1) {
        baseColor = texture(uAlbedo, aTexCoords);
    } else {
        baseColor = vec4(uMatAlbedo, 1.0);
    }
    vec4 worldPos = uM * aPosition;
    vec3 phongResult = phongReflectionModel(aNormal, worldPos.xyz, uCamPos, uLightVec, uLightColorPreCalc, uLightColor, uAmbientLight, baseColor.rgb, uMatDiffuseness, uMatSpecularity, uMatShininess);
    vColor = vec4(phongResult, baseColor.a);
    gl_Position = uVP * worldPos;
}
