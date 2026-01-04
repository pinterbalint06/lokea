class fpsCounter
{
private:
    int frameCount_;
    double lastTime_;

public:
    fpsCounter();
    void update();
};