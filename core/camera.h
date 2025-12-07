#ifndef CAMERA_H
#define CAMERA_H
#include <cstdint>

class Camera{
    private:
        float height;
    public:
        Camera();
        ~Camera();

        void setHeight(float height) {
            this->height = height;
        }
};

#endif