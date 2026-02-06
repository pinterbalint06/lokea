#version 300 es

#line 1 0

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
    vec4 baseColor;
    if(uUseTexture == 1) {
        baseColor = texture(uAlbedo, vTexCoords);
    } else {
        baseColor = vec4(uMatAlbedo, 1.0);
    }
    vec3 phongResult = phongReflectionModel(normal, vPosition.xyz, uCamPos, uLightVec, uLightColorPreCalc, uLightColor, uAmbientLight, baseColor.rgb, uMatDiffuseness, uMatSpecularity, uMatShininess);
    outColor = vec4(phongResult, baseColor.a);
}