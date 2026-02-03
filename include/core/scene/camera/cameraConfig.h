#ifndef CAMERA_CONFIG_H
#define CAMERA_CONFIG_H

struct CameraConfig
{
    float rotationSensitivity = 0.2f;
    float zoomSensitivity = 0.001f;

    float minFocalLength = 10.5f;
    float maxFocalLength = 150.0f;

    float minOrthoHeight = 2.5f;
    float maxOrthoHeight = 0.2f;
};

constexpr CameraConfig DEFAULT_CAMERA_SETTINGS;

#endif