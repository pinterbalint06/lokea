#include <memory>
#include <vector>
#include <string>
#include <utils/fileUtils.h>
#include <utils/shaderBuilder.h>

namespace
{
    std::string loadHelperFiles(const std::vector<std::string> &helperPaths)
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

    void insertHelpers(std::string &insertInto, const std::string &helper)
    {
        int versionLocation = insertInto.find("#version");
        int lineAfterVersion = insertInto.find("\n", versionLocation);
        insertInto.insert(lineAfterVersion + 1, "\n" + helper + "\n");
    }
}

namespace ShaderBuilder
{
    std::unique_ptr<Shaders::Shader> createShader(const char *pathToVertex, const char *pathToFragment, const std::vector<std::string> &helperPaths)
    {
        // read files
        std::string vCode = FileUtils::readFile(pathToVertex);
        std::string fCode = FileUtils::readFile(pathToFragment);
        std::string helpers = loadHelperFiles(helperPaths);

        // insert helpers
        insertHelpers(vCode, helpers);
        insertHelpers(fCode, helpers);

        return std::make_unique<Shaders::Shader>(vCode, fCode);
    }
}
