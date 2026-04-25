#include <emscripten/bind.h>
#include <string>

#include "equirectangular/equirectangularEngine.h"

EMSCRIPTEN_BINDINGS(equirectangularEngineBinding)
{
    emscripten::class_<EquirectangularEngine, emscripten::base<Engine>>("EquirectangularEngine")
        .constructor<std::string>()
        .function("loadEquirectangularImage", &EquirectangularEngine::loadEquirectangularImage)
        .function("clearImage", &EquirectangularEngine::clearImage)
        .function("addArrow", &EquirectangularEngine::addArrow)
        .function("doesArrowExist", &EquirectangularEngine::doesArrowExist)
        .function("removeArrow", &EquirectangularEngine::removeArrow)
        .function("changeArrowDirection", &EquirectangularEngine::changeArrowDirection)
        .function("clearArrows", &EquirectangularEngine::clearArrows)
        .function("getClickedArrow", &EquirectangularEngine::getClickedArrow);
}
