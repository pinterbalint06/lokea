precision highp float;
precision highp int;

layout(std140) uniform PerlinData {
    int seed;          // 0
    int octaveCount;   // 4
    float frequency;   // 8
    float amplitude;   // 12
    float persistence; // 16
    float lacunarity;  // 20
    float noiseSize;   // 24
                       // total of 24 bytes
};

vec3 calculateNoiseNormal(vec2 pos) {
    return vec3(0.0, 1.0, 0.0);
}