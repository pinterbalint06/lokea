#include <emscripten.h>
#include <emscripten/html5.h>
#include <emscripten/html5_webgl.h>
#include <GLES2/gl2.h>
#include <core/terrain.h>
#include <core/mesh.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

GLuint program;
GLuint vbo, ibo;
Terrain *terrain;

std::string ReadFile(const std::string &path)
{
    std::ifstream file(path);
    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

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

        std::string vertexShaderString = ReadFile("shaders/vertex.vert");
        const char *vertexSrc = vertexShaderString.c_str();
        GLuint vs = glCreateShader(GL_VERTEX_SHADER);
        glShaderSource(vs, 1, &vertexSrc, NULL);
        glCompileShader(vs);

        std::string fragmentShaderString = ReadFile("shaders/fragment.frag");
        const char *fragSrc = fragmentShaderString.c_str();
        GLuint fs = glCreateShader(GL_FRAGMENT_SHADER);
        glShaderSource(fs, 1, &fragSrc, NULL);
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