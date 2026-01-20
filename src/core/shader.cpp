#include <core/shader.h>
#include <GLES3/gl3.h>
#include <string>
#include <utils/fileUtils.h>
#include <vector>
#include <emscripten/emscripten.h>

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

    std::string Shader::loadHelperFiles(const std::vector<std::string> &helperPaths)
    {
        std::string helpers = "";

        for (int i = 0; i < helperPaths.size(); i++)
        {
            std::string helper = FileUtils::readFile(helperPaths[i]);
            int lineLocatin = helper.find("#line 1");
            if (lineLocatin != -1)
            {
                // + 7 so it is added after #line 1
                helper.insert(lineLocatin + 7, " " + std::to_string(i + 1));
            }
            helpers += helper + "\n";
        }
        return helpers;
    }

    void Shader::insertHelpers(std::string &insertInto, const std::string &helper)
    {
        int versionLocation = insertInto.find("#version");
        int lineAfterVersion = insertInto.find("\n", versionLocation);
        insertInto.insert(lineAfterVersion + 1, "\n" + helper + "\n");
    }

    Shader::Shader(const char *pathToVertex, const char *pathToFragment, const std::vector<std::string> &helperPaths)
    {
        // read files
        std::string vCode = FileUtils::readFile(pathToVertex);
        std::string fCode = FileUtils::readFile(pathToFragment);
        std::string helpers = loadHelperFiles(helperPaths);

        // insert helpers
        insertHelpers(vCode, helpers);
        insertHelpers(fCode, helpers);

        // compile shaders
        GLuint vertexShader = compileShader(vCode.c_str(), GL_VERTEX_SHADER);
        GLuint fragmentShader = compileShader(fCode.c_str(), GL_FRAGMENT_SHADER);

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
