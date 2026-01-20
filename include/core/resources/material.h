#ifndef MATERIAL_H
#define MATERIAL_H

#include <cmath>

// Forward declaration
class Texture; // defined in "core/resources/texture.h"

namespace Materials
{
    struct MaterialData
    {
        float albedo[3];   ///< Base color of the material.
        float diffuseness; ///< Diffuse reflection coefficient [0;1].
        float specularity; ///< Specular reflection coefficient [0;1].
        float shininess;   ///< Specular exponent (shininess factor) [1; infinity[.
        float pad2[2];
    };
    /**
     * @brief Represents an RGB color with helper methods for gamma correction.
     */
    struct Color
    {
        float r, g, b; ///< Red, Green, Blue components in range [0, 1].

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
            return returnColor;
        }
    };

    /**
     * @brief Defines surface properties for lighting calculations.
     */
    class Material
    {
    private:
        MaterialData data_; ///< The UBO to be uploaded.
        Texture *texture_;

    public:
        Material(Color albedo, float diffuseness, float specularity, float shininess);

        // getters
        Color getAlbedo() const { return Color::fromsRGB(data_.albedo[0], data_.albedo[1], data_.albedo[2]); }
        float getDiffuseness() const { return data_.diffuseness; }
        float getSpecularity() const { return data_.specularity; }
        float getShininess() const { return data_.shininess; }
        Texture *getTexture() const { return texture_; }

        const MaterialData &getUBOData() const { return data_; }

        // setters
        void setAlbedo(Color albedo);
        void setDiffuseness(float diffuseness);
        void setSpecularity(float specularity);
        void setShininess(float shininess);
        void setTexture(Texture *tex);

        /**
         * @brief Predefined material resembling grass.
         * @return Material A green, low-specularity material.
         */
        static Material Grass()
        {
            return Material(Color::fromRGB(65, 152, 10), 1.0f, 0.02f, 10.0f);
        }

        /**
         * @brief Predefined material resembling dirt.
         * @return Material A brown, low-specularity material.
         */
        static Material Dirt()
        {
            return Material(Color::fromRGB(155, 118, 83), 1.0f, 0.01f, 10.0f);
        }

        /**
         * @brief Predefined material resembling purple error.
         * @return Material The purple error.
         */
        static Material Error()
        {
            return Material(Color::fromRGB(255, 0, 255), 1.0f, 0.0f, 1.0f);
        }
    };
};

#endif