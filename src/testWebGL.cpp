#include <emscripten.h>
#include <emscripten/html5.h>
#include <emscripten/html5_webgl.h>
#include <GLES2/gl2.h>
#include <core/terrain.h>
#include <core/mesh.h>

const char *vertexShaderSource = R"(
    attribute vec4 aPosition;
    void main() {
        gl_Position = aPosition;
    }
)";

const char *fragmentShaderSource = R"(
    precision mediump float;
    void main() {
        gl_FragColor = vec4(1.0, 0.5, 0.2, 1.0); // Orange
    }
)";

GLuint program;
GLuint vbo, ibo;
Terrain *terrain;

void render()
{
    glClear(GL_COLOR_BUFFER_BIT);
    GLint posAttrib = glGetAttribLocation(program, "aPosition");
    glVertexAttribPointer(posAttrib, 3, GL_FLOAT, GL_FALSE, 0, 0);
    glEnableVertexAttribArray(posAttrib);

    glDrawElements(GL_TRIANGLES, terrain->getMesh()->getIndexCount(), GL_UNSIGNED_INT, 0);
}

int main()
{
    EmscriptenWebGLContextAttributes attrs;
    emscripten_webgl_init_context_attributes(&attrs);
    int ctx = emscripten_webgl_create_context("#canvas", &attrs);
    if (!ctx)
    {
        EM_ASM(
            console.log('A böngésződ nem támogatja a WebGL-t!'););
    }
    else
    {
        emscripten_webgl_make_context_current(ctx);
        glClearColor(0, 0, 0, 1);
        glClear(GL_COLOR_BUFFER_BIT);
        EM_ASM(
            console.log('WebGL sikeresen inicializálva!'););

        GLuint vs = glCreateShader(GL_VERTEX_SHADER);
        glShaderSource(vs, 1, &vertexShaderSource, NULL);
        glCompileShader(vs);

        GLuint fs = glCreateShader(GL_FRAGMENT_SHADER);
        glShaderSource(fs, 1, &fragmentShaderSource, NULL);
        glCompileShader(fs);

        program = glCreateProgram();
        glAttachShader(program, vs);
        glAttachShader(program, fs);
        glLinkProgram(program);
        glUseProgram(program);

        terrain = new Terrain(256);
        terrain->regenerate();

        glGenBuffers(1, &vbo);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, terrain->getMesh()->getVertexCount() * sizeof(float), terrain->getMesh()->getVertices(), GL_STATIC_DRAW);
        glGenBuffers(1, &ibo);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, terrain->getMesh()->getIndexCount() * sizeof(uint32_t), terrain->getMesh()->getIndices(), GL_STATIC_DRAW);
        render();
    }
    return 0;
}