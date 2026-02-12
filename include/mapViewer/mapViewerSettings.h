#ifndef MAP_VIEWER_SETTINGS_H
#define MAP_VIEWER_SETTINGS_H

struct MapViewerSettings
{
    float minZoom = 1.0f;
    float maxZoom = 50.0f;

    float zoomSensitivity = 0.01f;
};

#endif