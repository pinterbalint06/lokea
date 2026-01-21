#ifndef FPS_COUNTER_H
#define FPS_COUNTER_H

#include <string>

class FPSCounter
{
private:
    int frameCount_;
    double lastTime_;
    std::string id_;

public:
    FPSCounter(std::string id);
    void update();
};

#endif