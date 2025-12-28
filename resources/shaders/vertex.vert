attribute vec4 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoords;
varying vec3 vNormal;
void main() {
    vNormal = aNormal;
    vec4 scaledPos = aPosition;
    scaledPos.xyz = (scaledPos.xyz / 25.0);
    gl_Position = scaledPos;
}
