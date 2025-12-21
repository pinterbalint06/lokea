#ifndef CLIPPING_H
#define CLIPPING_H

struct Vertex;

class Clipper
{
private:
    Vertex *clipped_;
    Vertex *input_;
    int clippedSize_;
    int inputSize_;

    void SutherlandHodgman(const Vertex &pont0, const Vertex &pont1, const Vertex &pont2);

public:
    Clipper();
    ~Clipper();

    // getter
    Vertex *getClipped() { return clipped_; }
    int getClippedSize() { return clippedSize_; }

    // Sutherland-Hodgman
    void clip(const Vertex &pont0, const Vertex &pont1, const Vertex &pont2);
};

#endif
