#include <emscripten/emscripten.h>
#include <GLES3/gl3.h>
#include <string>

#include "core/rendering/shader.h"

namespace Shaders
{
    GLuint Shader::compileShader(const char *src, GLuint type)
    {
        int success;
        GLuint shader = glCreateShader(type);
        glShaderSource(shader, 1, &src, NULL);
        glCompileShader(shader);

        glGetShaderiv(shader, GL_COMPILE_STATUS, &success);
        if (!success)
        {
            char infoLog[512];
            glGetShaderInfoLog(shader, 512, NULL, infoLog);
            EM_ASM({ throw("Sikertelen shader fordítás: " + UTF8ToString($0)); }, infoLog);
        };
        return shader;
    }

    Shader::Shader(std::string vertexCode, std::string fragmentCode)
    {
        // compile shaders
        GLuint vertexShader = compileShader(vertexCode.c_str(), GL_VERTEX_SHADER);
        GLuint fragmentShader = compileShader(fragmentCode.c_str(), GL_FRAGMENT_SHADER);

        // create program
        programID_ = glCreateProgram();

        // attach shaders to program
        glAttachShader(programID_, vertexShader);
        glAttachShader(programID_, fragmentShader);

        // link program
        glLinkProgram(programID_);

        // get success
        int success;
        glGetProgramiv(programID_, GL_LINK_STATUS, &success);
        if (!success)
        {
            char infoLog[512];
            glGetProgramInfoLog(programID_, 512, NULL, infoLog);
            EM_ASM({ throw("Sikertelen shader összekapcsolás: " + UTF8ToString($0)); }, infoLog);
        }

        // delete shaders
        glDeleteShader(vertexShader);
        glDeleteShader(fragmentShader);
    }

    Shader::~Shader()
    {
        if (programID_ != 0)
        {
            glDeleteProgram(programID_);
        }
    }

    void Shader::use()
    {
        glUseProgram(programID_);
    }

    void Shader::bindUniformBlock(const std::string &uboName, int bindingSlot)
    {
        GLuint uboIndex = glGetUniformBlockIndex(programID_, uboName.c_str());
        if (uboIndex != GL_INVALID_INDEX)
        {
            glUniformBlockBinding(programID_, uboIndex, bindingSlot);
        }
    }

    int Shader::getUniformLocation(const std::string &uniformName)
    {
        int location;
        if (uniformLocCache_.contains(uniformName))
        {
            location = uniformLocCache_[uniformName];
        }
        else
        {
            location = glGetUniformLocation(programID_, uniformName.c_str());
            uniformLocCache_[uniformName] = location;
        }
        return location;
    }

    void Shader::setUniformInt(const std::string &uniformName, int value)
    {
        int uniformLoc = getUniformLocation(uniformName);
        if (uniformLoc != -1)
        {
            glUniform1i(uniformLoc, value);
        }
    }
}
