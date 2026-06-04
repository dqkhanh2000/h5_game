const CACTUS_COLOR = "#16a34a";
const CACTUS_DARK_COLOR = "#166534";

class Obstacle extends GameObject {
    constructor(context, x, groundY, speed) {
        let width = 28 + Math.random() * 20;
        let height = 42 + Math.random() * 28;
        super(context, x, groundY - height, width, height, -speed, 0);
        this.scored = false;
    }

    draw() {
        this.context.fillStyle = CACTUS_COLOR;
        this.context.fillRect(this.x + this.width * 0.35, this.y, this.width * 0.3, this.height);

        this.context.fillRect(this.x, this.y + this.height * 0.35, this.width * 0.35, 10);
        this.context.fillRect(this.x + this.width * 0.65, this.y + this.height * 0.52, this.width * 0.35, 10);

        this.context.fillStyle = CACTUS_DARK_COLOR;
        this.context.fillRect(this.x + this.width * 0.48, this.y + 5, 3, this.height - 10);
    }

    isOffScreen() {
        return this.right() < 0;
    }

    hasPassed(dino) {
        return !this.scored && this.right() < dino.x;
    }
}
