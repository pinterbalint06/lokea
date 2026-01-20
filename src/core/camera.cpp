#include "core/camera.h"
#include "utils/mathUtils.h"
#include <cmath>
#include <algorithm>

Camera::Camera()
{
    viewMatrix_ = (float *)malloc(16 * sizeof(float));
    projMatrix_ = (float *)malloc(16 * sizeof(float));
    MathUtils::setIdentity(viewMatrix_);
    MathUtils::setIdentity(projMatrix_);
    data_.camPos[0] = 0;
    data_.camPos[1] = 0;
    data_.camPos[2] = 0;
    yaw_ = 0;
    pitch_ = 0;
    newView_ = true;
}

Camera::~Camera()
{
    if (viewMatrix_)
    {
        free(viewMatrix_);
    }
    if (projMatrix_)
    {
        free(projMatrix_);
    }
}

void Camera::setPosition(float x, float y, float z)
{
    data_.camPos[0] = x;
    data_.camPos[1] = y;
    data_.camPos[2] = z;
    newView_ = true;
}

void Camera::setRotation(float pitch, float yaw)
{
    pitch_ = pitch;
    yaw_ = yaw;
    newView_ = true;
}

void Camera::rotate(float dPitch, float dYaw)
{
    // clamp to [-pi/2;pi/2]
    pitch_ = std::clamp<float>(pitch_ + dPitch, -M_PI_2, M_PI_2);
    yaw_ += dYaw;
    // wrap to [-2pi;2pi]
    if (yaw_ >= MathUtils::TWO_PI)
    {
        yaw_ -= MathUtils::TWO_PI;
    }
    else
    {
        if (yaw_ <= -MathUtils::TWO_PI)
        {
            yaw_ += MathUtils::TWO_PI;
        }
    }
    newView_ = true;
}

void Camera::updateViewMatrix()
{
    if (newView_)
    {
        float yRotMatr[16] = {0};
        float xRotMatr[16] = {0};
        float rotMatr[16] = {0};
        float translation[16] = {0};

        float sinY = sinf(yaw_);
        float cosY = cosf(yaw_);
        float sinX = sinf(pitch_);
        float cosX = cosf(pitch_);

        /*
        Y rotation matrix:
            [cos, 0,  -sin, 0]
            [0,   1,  0,    0]
            [sin, 0,  cos,  0]
            [0,   0,  0,    1]
        */
        MathUtils::setIdentity(yRotMatr);
        yRotMatr[0] = cosY;
        yRotMatr[2] = -sinY;
        yRotMatr[8] = sinY;
        yRotMatr[10] = cosY;

        /*
        X rotation matrix:
            [1, 0,    0,   0]
            [0, cos,  sin, 0]
            [0, -sin, cos, 0]
            [0, 0,    0,   1]
        */
        MathUtils::setIdentity(xRotMatr);
        xRotMatr[5] = cosX;
        xRotMatr[6] = sinX;
        xRotMatr[9] = -sinX;
        xRotMatr[10] = cosX;

        // order: Z Y X
        MathUtils::multiplyMatrix(yRotMatr, xRotMatr, rotMatr);

        // translation matrix
        MathUtils::setIdentity(translation);
        translation[12] = -data_.camPos[0];
        translation[13] = -data_.camPos[1];
        translation[14] = -data_.camPos[2];

        MathUtils::multiplyMatrix(translation, rotMatr, viewMatrix_);
        newView_ = false;
        newViewProj_ = true;
    }
}

void Camera::updateViewProjectionMatrix()
{
    if (newViewProj_)
    {
        MathUtils::multiplyMatrix(getViewMatrix(), getProjMatrix(), data_.VP);
        newViewProj_ = false;
    }
}

void Camera::setPerspective(float focal, float filmW, float filmH, int imageW, int imageH, float n, float f)
{
    focalLength_ = focal;
    filmW_ = filmW;
    filmH_ = filmH;
    imageW_ = imageW;
    imageH_ = imageH;
    n_ = n;
    f_ = f;
    updatePerspective();
}

void Camera::setImageDimensions(int imageW, int imageH)
{
    imageW_ = imageW;
    imageH_ = imageH;
    updatePerspective();
}

void Camera::setFocalLength(float focalLength)
{
    focalLength_ = focalLength;
    updatePerspective();
}

void Camera::updatePerspective()
{
    // aspect ratios
    float imageAspect = (float)imageW_ / imageH_;
    float filmAspect = filmW_ / filmH_;

    float t = (filmH_ / 2.0f) / focalLength_ * n_;
    float r = t * filmAspect;

    // if film aspect ratio is different from image aspect ratio
    if (filmAspect > imageAspect)
    {
        r *= imageAspect / filmAspect;
    }
    else
    {
        t *= filmAspect / imageAspect;
    }
    float b = -t;
    float l = -r;

    // reset perspective projection matrix
    memset(projMatrix_, 0, 16 * sizeof(float));
    projMatrix_[0] = 2.0f * n_ / (r - l);
    projMatrix_[5] = 2.0f * n_ / (t - b);
    projMatrix_[8] = (r + l) / (r - l);
    projMatrix_[9] = (t + b) / (t - b);
    projMatrix_[10] = f_ / (n_ - f_);
    projMatrix_[11] = -1.0f;
    projMatrix_[14] = n_ * f_ / (n_ - f_);
    newViewProj_ = true;
}