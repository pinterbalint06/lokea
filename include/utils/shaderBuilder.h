#ifndef SHADER_MANAGER_H
#define SHADER_MANAGER_H

#include <memory>
#include <vector>
#include <string>

// Forward declaration
namespace Shaders
{
    class Shader; // defined in "core/rendering/shader.h"
}

namespace ShaderBuilder
{
    std::unique_ptr<Shaders::Shader> createShader(const char *pathToVertex, const char *pathToFragment, const std::vector<std::string> &helperPaths);
}

#endif