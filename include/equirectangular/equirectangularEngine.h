#ifndef EQUIRECTANGULAR_ENGINE_H
#define EQUIRECTANGULAR_ENGINE_H

#include <string>
#include <vector>
#include <memory>

#include "core/math/vector.h"

#include "core/engine.h"

// Forward declaration
class Mesh; // defined in "core/resources/mesh.h"

enum EQUIRECTANGULARMODE
{
    FULL = 1,
    SPLIT_2X2 = 2,
    SPLIT_4X4 = 4
};

// TODO: ennek osztaly es renderelese
struct ArrowVector
{
    int id;
    Vec2 direction;
};

class EquirectangularEngine : public Engine
{
private:
    int currentRequestID;
    std::vector<ArrowVector> arrows_;

    std::shared_ptr<Mesh> generateSphereSegment(int rings, int segments, float radius,
                                float uMin, float uMax, float vMin, float vMax);
    void generateSphere();
    std::vector<std::shared_ptr<Texture>> imageTiles_;
    EQUIRECTANGULARMODE currMode_;

    void changeImageMode(EQUIRECTANGULARMODE mode);
    void uploadTiles(const std::string &url, int ctx, emscripten::val onSuccess, emscripten::val onError);

public:
    EquirectangularEngine(const std::string &canvasID);
    ~EquirectangularEngine();
    void loadEquirectangularImage(const std::string &url, int width, int height, emscripten::val onSuccess, emscripten::val onError);
    void clearImage();

    void clearArrows();
    void addArrow(int id, float yaw);
    int getClickedArrow(float screenX, float screenY);
};

#endif