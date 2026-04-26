#ifndef MATERIAL_H
#define MATERIAL_H

#include <cmath>
#include <memory>

// Forward declaration
class Texture; // defined in "core/resources/texture.h"

namespace Materials
{
    struct MaterialData
    {
        float color[4];   ///< Base color of the material.
    };
    /**
     * @brief Represents an RGB color with helper methods for gamma correction.
     */
    struct Color
    {
        float r, g, b, a; ///< Red, Green, Blue components in range [0, 1].

        /**
         * @brief Creates a Color object from 0-1 float sRGB values.
         * @param r Red component (0-1).
         * @param g Green component (0-1).
         * @param b Blue component (0-1).
         * @return Color The color in sRGB space.
         */
        static Color fromsRGB(float r, float g, float b)
        {
            Color returnColor;
            returnColor.r = r;
            returnColor.g = g;
            returnColor.b = b;
            returnColor.a = 1.0f;
            return returnColor;
        }

        /**
         * @brief Creates a Color object from 0-255 integer RGB values.
         * Applies gamma correction (power of 2.2).
         * @param r Red component (0-255).
         * @param g Green component (0-255).
         * @param b Blue component (0-255).
         * @return Color The normalized and gamma-corrected color.
         */
        static Color fromRGB(float r, float g, float b)
        {
            Color returnColor;
            returnColor.r = std::pow(r / 255.0f, 2.2f);
            returnColor.g = std::pow(g / 255.0f, 2.2f);
            returnColor.b = std::pow(b / 255.0f, 2.2f);
            returnColor.a = 1.0f;
            return returnColor;
        }

        /**
         * @brief Creates a Color object from 0-255 integer RGB values.
         * Applies gamma correction (power of 2.2).
         * @param r Red component (0-255).
         * @param g Green component (0-255).
         * @param b Blue component (0-255).
         * @param a Alpha component (0-255).
         * @return Color The normalized and gamma-corrected color.
         */
        static Color fromRGBA(float r, float g, float b, float a)
        {
            Color returnColor;
            returnColor.r = std::pow(r / 255.0f, 2.2f);
            returnColor.g = std::pow(g / 255.0f, 2.2f);
            returnColor.b = std::pow(b / 255.0f, 2.2f);
            returnColor.a = a / 255.0f;
            return returnColor;
        }
    };

    /**
     * @brief Stores color and texture for mesh
     */
    class Material
    {
    private:
        MaterialData data_; ///< The UBO to be uploaded.
        std::shared_ptr<Texture> texture_;

    public:
        Material(Color color);

        // getters
        Color getColor() const { return Color::fromsRGB(data_.color[0], data_.color[1], data_.color[2]); }
        std::shared_ptr<Texture> getTexture() const { return texture_; }

        const MaterialData &getUBOData() const { return data_; }

        // setters
        void setColor(Color color);
        void setTexture(std::shared_ptr<Texture> tex);

        /**
         * @brief Predefined material resembling purple error.
         * @return Material The purple error.
         */
        static Material Error()
        {
            return Material(Color::fromRGB(255, 0, 255));
        }
    };
};

#endif