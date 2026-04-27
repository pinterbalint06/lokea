#include <emscripten/emscripten.h>
#include <cmath>
#include <algorithm>
#include <memory>

#include "core/math/vector.h"
#include "core/projection/projectionMatrix.h"
#include "core/projection/orthographicProjectionMatrix.h"
#include "core/projection/perspectiveProjectionMatrix.h"

#include "core/scene/camera/cameraConfig.h"
#include "core/scene/camera/camera.h"

#include "core/math/mathUtils.h"

Camera::Camera()
{
    currentProjectionType_ = PROJECTIONTYPE::PERSPECTIVE;
    projectionMatrix_ = std::make_unique<PerspectiveProjectionMatrix>(0.1f, 1000.0f);
    viewMatrix_ = Mat4::identity();
    data_.camPos[0] = 0;
    data_.camPos[1] = 0;
    data_.camPos[2] = 0;

    zoomFactor_ = 0.05f;

    filmW_ = 25.4f;
    filmH_ = 25.4f;

    imageW_ = 1000.0f;
    imageH_ = 1000.0f;

    recalculateCanvasBoundaries();

    yaw_ = 0.0f;
    pitch_ = 0.0f;
    isViewMatrixDirty_ = true;
    isViewProjMatrixDirty_ = true;
}

Camera::~Camera()
{
}

Vec3 Camera::getClickRayVector(float clickedPixelX, float clickedPixelY)
{
    float screenCenterRelativeX = (clickedPixelX / imageW_) * 2.0f - 1.0f;
    float screenCenterRelativeY = 1.0f - (clickedPixelY / imageH_) * 2.0f;

    Vec3 straightRayOutFromLens(
        screenCenterRelativeX * projectionMatrix_->getRightClippingPlane(),
        screenCenterRelativeY * projectionMatrix_->getTopClippingPlane(),
        -projectionMatrix_->getNearClippingPlane()
    );

    Vec3 inverseViewRight(viewMatrix_[0], viewMatrix_[4], viewMatrix_[8]);
    Vec3 inverseViewUp(viewMatrix_[1], viewMatrix_[5], viewMatrix_[9]);
    Vec3 inverseViewBack(viewMatrix_[2], viewMatrix_[6], viewMatrix_[10]);

    Vec3 finalWorldDirection = (inverseViewRight * straightRayOutFromLens.x) +
        (inverseViewUp * straightRayOutFromLens.y) +
        (inverseViewBack * straightRayOutFromLens.z);

    finalWorldDirection.normalize();

    return finalWorldDirection;
}

void Camera::setPosition(float x, float y, float z)
{
    data_.camPos[0] = x;
    data_.camPos[1] = y;
    data_.camPos[2] = z;
    isViewMatrixDirty_ = true;
}

void Camera::setRotation(float pitch, float yaw)
{
    pitch_ = pitch;
    yaw_ = MathUtils::normalizeAngleRadians(yaw);
    isViewMatrixDirty_ = true;
}

void Camera::setPitch(float pitch)
{
    pitch_ = pitch;
    isViewMatrixDirty_ = true;
}

void Camera::setYaw(float yaw)
{
    yaw_ = MathUtils::normalizeAngleRadians(yaw);
    isViewMatrixDirty_ = true;
}

void Camera::rotate(float dPitch, float dYaw)
{
    // clamp to [-pi/2;pi/2]
    float zoomCorrection = std::max((1.0f - zoomFactor_), 0.05f);
    float zoomCorrectedSensitivity = DEFAULT_CAMERA_SETTINGS.rotationSensitivity * zoomCorrection;

    pitch_ = std::clamp<float>(pitch_ + (dPitch * zoomCorrectedSensitivity), -M_PI_2, M_PI_2);
    yaw_ += dYaw * zoomCorrectedSensitivity;

    // normalize to [0;2pi[
    yaw_ = MathUtils::normalizeAngleRadians(yaw_);

    isViewMatrixDirty_ = true;
}

void Camera::updateViewMatrix()
{
    if (isViewMatrixDirty_)
    {
        Mat4 yRotMatr = Mat4::rotationY(yaw_);
        Mat4 xRotMatr = Mat4::rotationX(pitch_);

        // order: Z Y X
        Mat4 rotMatr = yRotMatr * xRotMatr;

        // translation matrix
        Mat4 translation = Mat4::translation(-data_.camPos[0], -data_.camPos[1], -data_.camPos[2]);

        viewMatrix_ = translation * rotMatr;
        isViewMatrixDirty_ = false;
        isViewProjMatrixDirty_ = true;
    }
}

void Camera::updateViewProjectionMatrix()
{
    if (isViewProjMatrixDirty_)
    {
        data_.VP = viewMatrix_ * projectionMatrix_->getProjectionMatrix();
        isViewProjMatrixDirty_ = false;
    }
}

void Camera::setProjectionMode(PROJECTIONTYPE mode)
{
    if (mode != currentProjectionType_)
    {
        currentProjectionType_ = mode;

        if (currentProjectionType_ == PROJECTIONTYPE::PERSPECTIVE)
        {
            projectionMatrix_ = std::make_unique<PerspectiveProjectionMatrix>(0.1f, 1000.0f);
        }
        else
        {
            projectionMatrix_ = std::make_unique<OrthographicProjectionMatrix>(0.0f, 1000.0f);
        }

        recalculateCanvasBoundaries();
    }
}

void Camera::setImageDimensions(int imageW, int imageH)
{
    imageW_ = imageW;
    imageH_ = imageH;
    recalculateCanvasBoundaries();
}

void Camera::zoom(float amount)
{
    float change = amount * DEFAULT_CAMERA_SETTINGS.zoomSensitivity;

    zoomFactor_ = std::clamp(zoomFactor_ + change, 0.0f, 1.0f);

    recalculateCanvasBoundaries();
}
void Camera::setZoom(float amount)
{
    zoomFactor_ = std::clamp(amount, 0.0f, 1.0f);

    recalculateCanvasBoundaries();
}

void Camera::recalculateCanvasBoundaries()
{
    float imageAspect = (float)imageW_ / imageH_;
    float top = 1.0f;
    float right = 1.0f;
    // aspect ratios
    if (currentProjectionType_ == PROJECTIONTYPE::PERSPECTIVE)
    {
        float filmAspect = filmW_ / filmH_;

        float near = projectionMatrix_->getNearClippingPlane();
        top = (filmH_ / 2.0f) / getFocalLength() * near;
        right = top * filmAspect;

        // if film aspect ratio is different from image aspect ratio
        if (filmAspect > imageAspect)
        {
            right *= imageAspect / filmAspect;
        }
        else
        {
            top *= filmAspect / imageAspect;
        }
    }
    else
    {
        top = getOrthoHeight() / 2.0f;
        // Width is derived from aspect ratio
        right = top * imageAspect;
    }
    projectionMatrix_->setTopClippingPlane(top);
    projectionMatrix_->setRightClippingPlane(right);

    projectionMatrix_->setBottomClippingPlane(-top);
    projectionMatrix_->setLeftClippingPlane(-right);

    // update view projection matrix
    isViewProjMatrixDirty_ = true;
}
