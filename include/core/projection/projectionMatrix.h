#ifndef PROJECTION_MATRIX_H
#define PROJECTION_MATRIX_H

class ProjectionMatrix
{
public:
    virtual ~ProjectionMatrix() = default;

    virtual void updateMatrix() = 0;

    void setNearClippingPlane(float n) { near_ = n; dirty_ = true; }
    void setFarClippingPlane(float f) { far_ = f; dirty_ = true; }
    void setLeftClippingPlane(float l) { left_ = l; dirty_ = true; }
    void setRightClippingPlane(float r) { right_ = r; dirty_ = true; }
    void setTopClippingPlane(float t) { top_ = t; dirty_ = true; }
    void setBottomClippingPlane(float b) { bottom_ = b; dirty_ = true; }

    float getNearClippingPlane() const { return near_; }
    float getFarClippingPlane() const { return far_; }
    float getLeftClippingPlane() const { return left_; }
    float getRightClippingPlane() const { return right_; }
    float getTopClippingPlane() const { return top_; }
    float getBottomClippingPlane() const { return bottom_; }

    const float *getProjectionMatrix() { updateMatrix(); return matrix_; }
protected:
    float left_, right_;
    float bottom_, top_;
    float near_, far_;
    float matrix_[16];
    bool dirty_;

    ProjectionMatrix(float near, float far);
};

#endif
