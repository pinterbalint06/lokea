#ifndef SHADER_H
#define SHADER_H

#include "utils/mathUtils.h"
#include "core/distantLight.h"
#include "core/material.h"
#include "core/vertex.h"
#include "core/texture.h"
#include <GLES3/gl3.h>
#include <string>
#include <map>

namespace Shaders
{
    class Shader
    {
    private:
        GLuint programID_;
        std::map<std::string, int> uniformLocCache_;
        GLuint compileShader(const char *src, GLuint type);
        std::string loadHelperFiles(const std::vector<std::string> &helperPaths);
        void insertHelpers(std::string &insertInto, const std::string &helper);
        int getUniformLocation(const std::string &uniformName);

    public:
        Shader(const char *pathToVertex, const char *pathToFragment, const std::vector<std::string> &helperPaths = {});
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