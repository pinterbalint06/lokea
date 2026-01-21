#line 1

precision highp float;
precision highp int;

layout(std140) uniform SceneData {
    float uAmbientLight;        // 4 bytes
};

layout(std140) uniform CameraData {
    mat4 uVP;                  // View-Projection Matrix
                                // layout 4 vec4 so 16 * 4 = 64 bytes
                                // row 1 : 0 bytes
                                // row 2 : 16 bytes
                                // row 3 : 32 bytes
                                // row 4 : 48 bytes
    vec3 uCamPos;               // Camera Position
                                // at 64 bytes -> 80 bytes
};

layout(std140) uniform MaterialData {
    vec3 uMatAlbedo;       // 0-12
    float uMatDiffuseness; // 12-16
    float uMatSpecularity; // 16-20
    float uMatShininess;   // 20-24
                           // 24-28-32
};

layout(std140) uniform DistantLightData {
    vec3 uLightVec;          // Light Vector
                             // at 0 bytes -> 16
    vec3 uLightColor;        // Light Color
                             // at 16 bytes -> 32
    vec3 uLightColorPreCalc; // Light Color pre calc
                             // at 32 bytes -> 48
};

layout(std140) uniform MeshData {
    mat4 uM;
};