#line 1

precision highp float;
precision highp int;

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
    vec4 uMatAlbedo;       // 0-15
    float uMatDiffuseness; // 16-19
    float uMatSpecularity; // 20-23
    float uMatShininess;   // 24-27
                           // 28-31
};

layout(std140) uniform MeshData {
    mat4 uM;
};