const BIRD_COLOR = "#facc15";
const BIRD_WING_COLOR = "#f97316";
const BIRD_EYE_COLOR = "#111827";

class Bird extends GameObject {
    constructor(context, x, y, size) {
        super(context, x, y, size, size);
        this.flapPower = -360;
        this.gravity = 900;
    }

    flap() {
        this.vy = this.flapPower;
    }

    update(secondsPassed) {
        this.vy += this.gravity * secondsPassed;
        super.update(secondsPassed);
    }

    draw() {
        let radius = this.width / 2;
        let centerX = this.x + radius;
        let centerY = this.y + radius;

        this.context.fillStyle = BIRD_COLOR;
        this.context.beginPath();
        this.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.context.fill();

        this.context.fillStyle = BIRD_WING_COLOR;
        this.context.beginPath();
        this.context.ellipse(
            this.x + radius * 0.75,
            this.y + radius * 1.1,
            radius * 0.55,
            radius * 0.3,
            -0.4,
            0,
            Math.PI * 2
        );
        this.context.fill();

        this.context.fillStyle = BIRD_EYE_COLOR;
        this.context.beginPath();
        this.context.arc(this.x + radius * 1.25, this.y + radius * 0.7, radius * 0.12, 0, Math.PI * 2);
        this.context.fill();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.vy = 0;
    }
}
