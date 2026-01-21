#ifndef FILE_UTILS_H
#define FILE_UTILS_H

#include <emscripten/emscripten.h>
#include <fstream>
#include <sstream>
#include <iostream>
#include <string>

namespace FileUtils
{
    inline std::string readFile(const std::string &filePath)
    {
        std::ifstream fileStream;
        std::stringstream stringStream;

        fileStream.open(filePath);
        if (fileStream.is_open())
        {
            stringStream << fileStream.rdbuf();
            fileStream.close();
        }
        else
        {
            EM_ASM(
                { throw("Sikertelen fájl beolvasás: " + UTF8ToString($0)); }, filePath.c_str());
        }
        return stringStream.str();
    }
}

#endif