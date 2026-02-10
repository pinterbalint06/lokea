#ifndef MAP_VIEWER_ENGINE_H
#define MAP_VIEWER_ENGINE_H

#include <string>
#include <memory>
#include <vector>

#include "core/engine.h"

// Forward declaration
class Mesh;               // defined in "core/resources/mesh.h"
class Vertex;             // defined in "core/resources/vertex.h"
class MapMarker;          // defined in "mapViewer/mapMarker.h"
struct mapViewerSettings; // defined in "mapViewer/mapViewerSettings.h"
namespace emscripten
{
    class val;            // defined in <emscripten/emscripten.val>
}

class MapViewerEngine : private Engine
{
private:
    float zoomLevel_;
    int width_, height_;
    bool isMapLoaded_;
    std::shared_ptr<Mesh> mapPlane_;
    MapViewerSettings settings_;
    std::vector<std::shared_ptr<MapMarker>> markers_;
    int mapWidth_, mapHeight_;
    // used as pan sensitivity so we use dPixel * texture coordinate per pixel when panning
    float uPerPixel_, vPerPixel_;

    void createMapPlane();
    void updateSingleMarker(MapMarker *markerPlane);
    void updateAllMarkers();
    void clearAllMarkers();
    void addMarkerByUV(int id, float u, float v, const std::string &type, const std::string &textureUrl);
    void recalculateUVPerPixel();
    void limitVCoordinates();
    void fitMapHorizontally();
    void getUVAtScreenPosition(float screenX, float screenY, float &u, float &v);
    void zoomMapUV(float zoomAmount, float zoomHereU, float zoomHereV);
    int getMarkerIndexById(int id);
    bool doesPointOverlapMarker(MapMarker *marker, float x, float y);

public:
    MapViewerEngine(const std::string &canvasID, int width, int height);
    ~MapViewerEngine();

    MapViewerSettings &getSettings() { return settings_; }

    void setSettings(MapViewerSettings newSettings)
    {
        settings_ = newSettings;
        // call zoom with no change to recalculate zoom
        zoomMapUV(0.0f, 0.0f, 0.0f);
    }

    void moveMap(float deltaX, float deltaY);
    void loadMap(const std::string &url, int mapWidth, int mapHeight, emscripten::val onSuccess, emscripten::val onError);
    void loadMap(const std::string &url, int mapWidth, int mapHeight);
    void zoomMapToCenter(float zoomAmount);
    void zoomMap(float zoomAmount, float zoomHereScreenX, float zoomHereScreenY);
    void render() { Engine::render(); }
    void addMarker(int id, float screenX, float screenY, const std::string &type, const std::string &textureUrl);
    void changeMarkerType(int id, const std::string &type, const std::string &textureUrl);
    void moveMarkerToImageCoordinates(int id, int xCoordinate, int yCoordinate);
    int getMarkerIdAtScreenCoords(int screenX, int screenY);
    void removeMarker(int id);
    void moveMarkerToScreen(int id, float screenX, float screenY);
    bool doesMarkerExist(int id);
    std::string getMarkerType(int id);
    emscripten::val getMarkerPosition(int id);
    void changeMarkerId(int oldId, int newId);
    void setCanvasSize(int width, int height);
};

#endif