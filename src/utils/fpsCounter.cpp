#include <utils/fpsCounter.h>
#include <emscripten.h>
#include <emscripten/bind.h>

fpsCounter::fpsCounter()
{
    frameCount_ = 0;
    lastTime_ = emscripten_get_now();
}

void fpsCounter::update()
{
    frameCount_++;
    double currentTime = emscripten_get_now();
    if (currentTime - lastTime_ >= 1000.0)
    {
        EM_ASM({ console.log('FPS: ' + $0); }, frameCount_);
        frameCount_ = 0;
        lastTime_ = currentTime;
    }
}
