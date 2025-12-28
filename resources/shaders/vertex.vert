#version 300 es

in vec4 aPosition;
in vec3 aNormal;
in vec2 aTexCoords;
out vec3 vNormal;
void main() {
    vNormal = aNormal;
    vec4 scaledPos = aPosition;
    scaledPos.xyz = (scaledPos.xyz / 25.0f);
    gl_Position = scaledPos;
}
