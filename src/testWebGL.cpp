#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/html5.h>
#include <emscripten/html5_webgl.h>
#include <GLES3/gl3.h>
#include <core/terrain.h>
#include <core/mesh.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <string>

GLuint program;
// vertex buffer object
GLuint vbo;
// element buffer object
GLuint ebo;
// vertax array object
GLuint vao;
Terrain *terrain;
double lastTime;
int frameCount;

void setCanvasSize(int width, int height)
{
    emscripten_set_canvas_element_size("#canvas", width, height);
}

std::string ReadFile(const std::string &path)
{
    std::ifstream file(path);
    std::stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

void render()
{
    frameCount++;
    double currentTime = emscripten_get_now();

    if (currentTime - lastTime >= 1000.0)
    {
        EM_ASM({ console.log('FPS: ' + $0); }, frameCount);
        frameCount = 0;
        lastTime = currentTime;
    }

    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glBindVertexArray(vao);

    glDrawElements(GL_TRIANGLES, terrain->getMesh()->getIndexCount(), GL_UNSIGNED_INT, 0);
    glBindVertexArray(0);
}

int main()
{
    EmscriptenWebGLContextAttributes attrs;
    emscripten_webgl_init_context_attributes(&attrs);
    attrs.majorVersion = 2;
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
        glDeleteShader(vs);
        glDeleteShader(fs);

        terrain = new Terrain(2048);
        terrain->regenerate();

        glGenVertexArrays(1, &vao);

        glBindVertexArray(vao);
        glGenBuffers(1, &vbo);
        glBindBuffer(GL_ARRAY_BUFFER, vbo);
        glBufferData(GL_ARRAY_BUFFER, terrain->getMesh()->getVertexCount() * sizeof(Vertex), terrain->getMesh()->getVertices(), GL_STATIC_DRAW);
        glGenBuffers(1, &ebo);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ebo);
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, terrain->getMesh()->getIndexCount() * sizeof(uint32_t), terrain->getMesh()->getIndices(), GL_STATIC_DRAW);
        GLint posAttrib = glGetAttribLocation(program, "aPosition");
        if (posAttrib != -1)
        {
            glVertexAttribPointer(posAttrib, 4, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void *)0);
            glEnableVertexAttribArray(posAttrib);
        }
        GLint normVec = glGetAttribLocation(program, "aNormal");
        if (normVec != -1)
        {
            glVertexAttribPointer(normVec, 3, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void *)(4 * sizeof(float)));
            glEnableVertexAttribArray(normVec);
        }
        GLint textureCoords = glGetAttribLocation(program, "aTexCoords");
        if (textureCoords != -1)
        {
            glVertexAttribPointer(textureCoords, 2, GL_FLOAT, GL_FALSE, sizeof(Vertex), (void *)(7 * sizeof(float)));
            glEnableVertexAttribArray(textureCoords);
        }
        glBindVertexArray(0);

        glEnable(GL_DEPTH_TEST);
        lastTime = emscripten_get_now();
        frameCount = 0;
        emscripten_set_main_loop(render, 0, 1);
    }
    return 0;
}

EMSCRIPTEN_BINDINGS(my_module)
{
    emscripten::function("updateCanvasSize", &setCanvasSize);
}
