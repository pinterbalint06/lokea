export class AnimationHelper {
    constructor(id, duration, maxBlur, forwardDistance) {
        this.id = id;

        this.duration = duration;

        this.maxBlur = maxBlur;
        this.forwardDistance = forwardDistance;

        this.startTime = performance.now();
        this.isLoadComplete = false;

    }

    loadCompleted() {
        if (!this.isLoadComplete) {
            this.isLoadComplete = true;

            let elapsed = performance.now() - this.startTime;
            let halfDuration = this.duration * 0.5;

            const shouldSkipToHalf = elapsed < halfDuration;
            if (shouldSkipToHalf) {
                this.startTime = performance.now() - halfDuration;
            }
        }
    }

    getFrameState(frameLocalYaw) {
        let elapsed = performance.now() - this.startTime;
        let progress = elapsed / this.duration;

        if (progress >= 0.5) {
            if (!this.isLoadComplete) {
                progress = 0.5;
                let halfDuration = this.duration * 0.5;
                this.startTime = performance.now() - halfDuration;
            }
        }

        progress = Math.min(progress, 1.0);

        const angle = progress <= 0.5
            ? (progress / 0.5) * (Math.PI / 2)
            : (1.5 * Math.PI) + ((progress - 0.5) / 0.5) * (Math.PI / 2);

        const forwardAmount = this.forwardDistance * Math.sin(angle);
        const transitionCurve = Math.sin(Math.PI * progress);

        const camX = Math.sin(frameLocalYaw) * forwardAmount;
        const camZ = -Math.cos(frameLocalYaw) * forwardAmount;
        const blur = this.maxBlur * transitionCurve;

        const isComplete = progress >= 1.0;

        return {
            camX: camX,
            camZ: camZ,
            blurPx: blur,
            isComplete: isComplete
        };
    }
}
