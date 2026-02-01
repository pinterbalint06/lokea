#include <emscripten/emscripten.h>
#include <cmath>
#include <algorithm>
#include <memory>

#include "core/projection/projectionMatrix.h"
#include "core/projection/perspectiveProjectionMatrix.h"

#include "core/scene/camera.h"

#include "core/math/mathUtils.h"

Camera::Camera()
{
    projectionMatrix_ = std::make_unique<PerspectiveProjectionMatrix>(0.1f, 1000.0f);
    MathUtils::setIdentity(viewMatrix_);
    data_.camPos[0] = 0;
    data_.camPos[1] = 0;
    data_.camPos[2] = 0;
    yaw_ = 0;
    pitch_ = 0;
    newView_ = true;
    newViewProj_ = true;
}

Camera::~Camera()
{
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
        float yRotMatr[16] = { 0 };
        float xRotMatr[16] = { 0 };
        float rotMatr[16] = { 0 };
        float translation[16] = { 0 };

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
        MathUtils::multiplyMatrix(viewMatrix_, projectionMatrix_->getProjectionMatrix(), data_.VP);
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
    projectionMatrix_->setNearClippingPlane(n);
    projectionMatrix_->setFarClippingPlane(f);
    recalculateCanvasBoundaries();
}

void Camera::setImageDimensions(int imageW, int imageH)
{
    imageW_ = imageW;
    imageH_ = imageH;
    recalculateCanvasBoundaries();
}

void Camera::setFocalLength(float focalLength)
{
    focalLength_ = focalLength;
    recalculateCanvasBoundaries();
}

void Camera::recalculateCanvasBoundaries()
{
    // aspect ratios
    float imageAspect = (float)imageW_ / imageH_;
    float filmAspect = filmW_ / filmH_;

    float near = projectionMatrix_->getNearClippingPlane();
    float top = (filmH_ / 2.0f) / focalLength_ * near;
    float right = top * filmAspect;

    // if film aspect ratio is different from image aspect ratio
    if (filmAspect > imageAspect)
    {
        right *= imageAspect / filmAspect;
    }
    else
    {
        top *= filmAspect / imageAspect;
    }
    projectionMatrix_->setTopClippingPlane(top);
    projectionMatrix_->setRightClippingPlane(right);

    projectionMatrix_->setBottomClippingPlane(-top);
    projectionMatrix_->setLeftClippingPlane(-right);

    // update perspective projection matrix
    newViewProj_ = true;
}