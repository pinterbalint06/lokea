#ifndef SHADER_H
#define SHADER_H

#include <string>
#include <map>
#include <GLES3/gl3.h>

namespace Shaders
{
    class Shader
    {
    private:
        GLuint programID_;
        std::map<std::string, int> uniformLocCache_;
        GLuint compileShader(const char *src, GLuint type);
        int getUniformLocation(const std::string &uniformName);

    public:
        Shader(std::string vertexCode, std::string fragmentCode);
        ~Shader();
        void use();

        GLuint getProgramID() { return programID_; }

        void bindUniformBlock(const std::string &uboName, int bindingSlot);
        void setUniformInt(const std::string &variableName, int value);
    };

    /// @brief The SHADINGMODE enum for selecting shading algorithms
    enum SHADINGMODE
    {
        PHONG = 0,      /// Phong shading
        GOURAUD = 1,    /// Gouraud shading
        NO_SHADING = 2, /// No shading
        // FLAT = 3      /// Flat shading
    };
}

#endif