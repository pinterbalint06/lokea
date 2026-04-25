const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;
const TWO_PI = Math.PI * 2.0;

export function degreeToRadian(angle) {
    return angle * DEG_TO_RAD;
}

export function radianToDegree(angleInRadians) {
    return angleInRadians * RAD_TO_DEG;
}

export function normalizeAngleRadians(angleInRadians) {
    let normalizedAngle = angleInRadians;

    if (Number.isFinite(normalizedAngle)) {
        normalizedAngle = angleInRadians - TWO_PI * Math.floor(angleInRadians / TWO_PI);

        if (Math.abs(TWO_PI - normalizedAngle) < 1e-5) {
            normalizedAngle = 0.0;
        }
    }

    return normalizedAngle;
}
