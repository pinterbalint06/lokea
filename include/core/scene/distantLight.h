#ifndef DISTANT_LIGHT_H
#define DISTANT_LIGHT_H

struct DistantLightData
{
    /// @brief The light vector (from point to light), represented as an array of three floats (x, y, z).
    float lightVec[3]; // 0-12
    float pad;         // 12-16

    /// @brief The color values of the light
    float lightColor[3]; // 16-28
    float pad2;          // 28-32

    /// @brief The precalculated color values of the light. Multiplied by light intensity and the inverse of pi.
    float lightColorPreCalc[3]; // 32-44
    float pad3;
};

class DistantLight
{
private:
    /// @brief The data of the light in std140 layout for GPU UBOs.
    DistantLightData data_;

    /// @brief The direction vector of the distant light, represented as an array of three floats (x, y, z).
    float lightDir_[3];

    /// @brief The intensity of the distant light source.
    float intensity_;

public:
    /**
     * @brief Constructs a DistantLight object with specified color, intensity, and direction.
     *
     * @param r         Red component of the light color [0.0; 1.0].
     * @param g         Green component of the light color [0.0; 1.0].
     * @param b         Blue component of the light color [0.0; 1.0].
     * @param intensity Intensity of the light.
     * @param x         X component of the light direction vector.
     * @param y         Y component of the light direction vector.
     * @param z         Z component of the light direction vector.
     *
     * Initializes the light's color, intensity, and direction, and precomputes color values
     * scaled by the inverse of PI and intensity for efficient lighting calculations.
     */

    DistantLight(float r, float g, float b, float intensity, float x, float y, float z);
    /**
     * @brief Destructor for the Distant Light class.
     *
     * Releases the memory allocated for the direction vector.
     */
    ~DistantLight();
    // getters
    /**
     * @brief Returns the red component of the distant light.
     *
     * @return The value of the red component as a float.
     */
    float getRed() const { return data_.lightColor[0]; }

    /**
     * @brief Returns the green component of the distant light.
     *
     * @return The value of the green component as a float.
     */
    float getGreen() const { return data_.lightColor[1]; }

    /**
     * @brief Returns the blue component of the distant light.
     *
     * @return The value of the blue component as a float.
     */
    float getBlue() const { return data_.lightColor[2]; }

    /**
     * @brief Retrieves the pre-calculated red component value of the distant light.
     *
     * @return The pre-calculated red intensity as a float.
     */
    float getRedCalculated() const { return data_.lightColorPreCalc[0]; }

    /**
     * @brief Retrieves the pre-calculated green component value of the distant light.
     *
     * @return The pre-calculated green value as a float.
     */
    float getGreenCalculated() const { return data_.lightColorPreCalc[1]; }

    /**
     * @brief Retrieves the pre-calculated blue component value of the distant light.
     *
     * @return The pre-calculated blue value as a float.
     */
    float getBlueCalculated() const { return data_.lightColorPreCalc[2]; }

    /**
     * @brief Returns the direction vector.
     *
     * @return Pointer to the direction vector.
     */
    const float *getDirection() const { return lightDir_; }

    /**
     * @brief Returns the data of the light in std140 layout for GPU UBOs.
     *
     * @return DistantLightData struct in std140 layout.
     */
    const DistantLightData &getUBOData() const { return data_; }

    // setters
    /**
     * @brief Sets the red color component of the distant light.
     *
     * Updates the internal red color value and recalculates the precomputed
     * red intensity value based on the current intensity and the inverse of PI.
     *
     * @param red The new red color component value.
     */
    void setRed(float red);

    /**
     * @brief Sets the green color component of the distant light.
     *
     * Updates the internal green color value and recalculates the precomputed
     * green intensity value based on the current intensity and the inverse of PI.
     *
     * @param green The new green color component value.
     */
    void setGreen(float green);

    /**
     * @brief Sets the blue color component of the distant light.
     *
     * Updates the internal blue color value and recalculates the precomputed
     * blue intensity value based on the current intensity and the inverse of PI.
     *
     * @param blue The new blue color component value.
     */
    void setBlue(float blue);

    /**
     * @brief Sets the color components of the distant light.
     *
     * Updates the internal color values and recalculates the precomputed
     * intensity values based on the current intensity and the inverse of PI.
     *
     * @param blue The new blue color component value.
     */
    void setColor(float red, float green, float blue);

    /**
     * @brief Sets the intensity of the distant light and updates pre-calculated color values.
     *
     * This function assigns the given intensity to the light source and recalculates
     * the pre-multiplied color components (red, green, blue) using the specified intensity
     * and the inverse of PI.
     *
     * @param intensity The new intensity value for the distant light.
     */
    void setIntensity(float intensity);

    /**
     * @brief Sets the direction vector of the distant light.
     *
     * This function updates the direction of the distant light source by assigning
     * the provided x, y, and z components to the internal direction vector.
     *
     * @param x The x component of the direction vector.
     * @param y The y component of the direction vector.
     * @param z The z component of the direction vector.
     */
    void setDirection(float x, float y, float z);
};

#endif