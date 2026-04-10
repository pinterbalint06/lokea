export class AnimationHelper {
    constructor(id, animationYaw, duration, maxBlur, forwardDistance) {
        this.id = id;

        this.animationYaw = animationYaw;

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

            const shouldSkipToHalf = elapsed >= halfDuration;
            if (shouldSkipToHalf) {
                this.startTime = performance.now() - halfDuration;
            }
        }
    }

    getFrameState() {
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

        const transitionCurve = Math.sin(Math.PI * progress);
        const forwardAmount = this.forwardDistance * transitionCurve;

        const camX = Math.sin(this.animationYaw) * forwardAmount;
        const camZ = -Math.cos(this.animationYaw) * forwardAmount;
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
