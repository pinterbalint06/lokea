#ifndef EQUIRECTANGULAR_ENGINE_H
#define EQUIRECTANGULAR_ENGINE_H

#include <string>
#include <vector>
#include <memory>

#include "core/math/vector.h"

#include "core/engine.h"
#include "equirectangular/equirectangularEngineConfig.h"

// Forward declaration
class Mesh; // defined in "core/resources/mesh.h"
class Arrow; // defined in "equirectangular/Arrow.h"

enum EQUIRECTANGULARMODE
{
    FULL = 1,
    SPLIT_2X2 = 2,
    SPLIT_4X4 = 4
};

class EquirectangularEngine : public Engine
{
private:
    int currentRequestId_;
    std::vector<std::shared_ptr<Arrow>> arrows_;

    std::shared_ptr<Mesh> generateSphereSegment(int rings, int segments, float radius,
                                float uMin, float uMax, float vMin, float vMax);
    void generateSphere();
    std::vector<std::shared_ptr<Texture>> imageTiles_;
    EQUIRECTANGULARMODE currMode_;

    void changeImageMode(EQUIRECTANGULARMODE mode);
    void uploadTiles(const std::string &url, int ctx, emscripten::val onSuccess, emscripten::val onError);

    bool isValidClick(const Vec3 &clickDirection, bool isSingleClick, bool &outIsDirectArrowClick);
    int findClosestArrowInDirection(const Vec3 &clickDirection, bool isDirectArrowClick);
    int getArrowIndexById(int id);
public:
    EquirectangularEngine(const std::string &canvasID);
    ~EquirectangularEngine();
    void loadEquirectangularImage(const std::string &url, int width, int height, emscripten::val onSuccess, emscripten::val onError);
    void clearImage();

    void clearArrows();
    void addArrow(int id, float yaw);
    bool doesArrowExist(int id);
    void removeArrow(int id);
    void changeArrowDirection(int id, float yaw);
    int getClickedArrow(float screenX, float screenY, bool isSingleClick);
};

#endif
