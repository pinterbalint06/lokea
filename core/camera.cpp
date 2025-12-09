#include "camera.h"

Camera::Camera()
{
    viewMatrix_ = (float *)malloc(16 * sizeof(float));
    projMatrix_ = (float *)malloc(16 * sizeof(float));
    setIdentity(viewMatrix_);
    setIdentity(projMatrix_);
    x_ = 0;
    y_ = 0;
    z_ = 0;
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

void Camera::setIdentity(float *m)
{
    memset(m, 0, 16 * sizeof(float));
    m[0] = 1.0f;
    m[5] = 1.0f;
    m[10] = 1.0f;
    m[15] = 1.0f;
}

void Camera::setPosition(float x, float y, float z)
{
    x_ = x;
    y_ = y;
    z_ = z;
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
    pitch_ += dPitch;
    yaw_ += dYaw;
    newView_ = true;
}

void Camera::multiplyMatrix(float *m1, float *m2, float *result)
{
    for (int i = 0; i < 4; i++)
    {
        for (int j = 0; j < 4; j++)
        {
            result[i * 4 + j] =
                m1[i * 4] * m2[j] +
                m1[i * 4 + 1] * m2[4 + j] +
                m1[i * 4 + 2] * m2[8 + j] +
                m1[i * 4 + 3] * m2[12 + j];
        }
    }
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
        setIdentity(yRotMatr);
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
        setIdentity(xRotMatr);
        xRotMatr[5] = cosX;
        xRotMatr[6] = sinX;
        xRotMatr[9] = -sinX;
        xRotMatr[10] = cosX;

        // order: Z Y X
        multiplyMatrix(yRotMatr, xRotMatr, rotMatr);

        // translation matrix
        setIdentity(translation);
        translation[12] = -x_;
        translation[13] = -y_;
        translation[14] = -z_;

        multiplyMatrix(translation, rotMatr, viewMatrix_);
        newView_ = false;
    }
}

void Camera::setPerspective(float focal, float filmW, float filmH, int imageW, int imageH, float n, float f)
{
    float xKitoltes = 1.0f;
    float yKitoltes = 1.0f;

    // aspect ratios
    float imageAspect = (float)imageW / imageH;
    float filmAspect = filmW / filmH;

    // if film aspect ratio is different from image aspect ratio
    if (filmAspect > imageAspect)
    {
        xKitoltes = imageAspect / filmAspect;
    }
    else
    {
        yKitoltes = filmAspect / imageAspect;
    }

    float t = ((filmH / 2.0f) / focal * n) * yKitoltes;
    float r = t * filmAspect * xKitoltes;
    float b = -t;
    float l = -r;

    // reset perspective projection matrix
    memset(projMatrix_, 0, 16 * sizeof(float));
    projMatrix_[0] = 2.0f * n / (r - l);
    projMatrix_[5] = 2.0f * n / (t - b);
    projMatrix_[8] = (r + l) / (r - l);
    projMatrix_[9] = (t + b) / (t - b);
    projMatrix_[10] = f / (n - f);
    projMatrix_[11] = -1.0f;
    projMatrix_[14] = n * f / (n - f);
}