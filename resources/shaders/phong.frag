#version 300 es

precision highp float;
precision highp int;

in vec4 vPosition;
in vec3 vNormal;
in vec2 vTexCoords;

uniform int uUseTexture;
uniform sampler2D uAlbedo;

uniform int uIsTerrain;

out vec4 outColor;

void main() {
    vec3 normal;
    if(uIsTerrain == 1) {
        vec2 noiseLocation = vec2(vPosition.x, -vPosition.z);
        normal = calculateFiniteDifference(noiseLocation, noiseParams);
    } else {
        normal = normalize(vNormal);
    }
    vec3 baseColor;
    if(uUseTexture == 1) {
        baseColor = texture(uAlbedo, vTexCoords).rgb;
    } else {
        baseColor = uMatAlbedo;
    }
    outColor = phongReflectionModel(normal, vPosition.xyz, uCamPos, uLightVec, uLightColorPreCalc, uLightColor, uAmbientLight, baseColor, uMatDiffuseness, uMatSpecularity, uMatShininess);
}