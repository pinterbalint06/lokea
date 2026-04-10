const DEG_TO_RAD = Math.PI / 180.0;

export function degreeToRadian(angle) {
    return angle * DEG_TO_RAD;
}

export function normalizeAngleRadians(angleInRadians) {
    let normalizedAngle = angleInRadians;

    if (Number.isFinite(normalizedAngle)) {
        while (normalizedAngle > Math.PI) {
            normalizedAngle -= 2 * Math.PI;
        }
        while (normalizedAngle <= -Math.PI) {
            normalizedAngle += 2 * Math.PI;
        }
    }

    return normalizedAngle;
}
