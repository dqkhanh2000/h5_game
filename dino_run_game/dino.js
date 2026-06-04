const DINO_COLOR = "#111827";
const DINO_BELLY_COLOR = "#334155";
const DINO_EYE_COLOR = "#f8fafc";

class Dino extends GameObject {
    constructor(context, x, groundY) {
        let width = 48;
        let height = 58;
        super(context, x, groundY - height, width, height);
        this.groundY = groundY;
        this.gravity = 1500;
        this.jumpPower = -620;
        this.onGround = true;
    }

    jump() {
        if (!this.onGround) {
            return;
        }

        this.vy = this.jumpPower;
        this.onGround = false;
    }

    update(secondsPassed) {
        this.vy += this.gravity * secondsPassed;
        super.update(secondsPassed);

        if (this.bottom() >= this.groundY) {
            this.y = this.groundY - this.height;
            this.vy = 0;
            this.onGround = true;
        }
    }

    draw() {
        let legOffset = this.onGround ? 0 : 4;

        this.context.fillStyle = DINO_COLOR;
        this.context.fillRect(this.x + 8, this.y + 14, 34, 34);
        this.context.fillRect(this.x + 25, this.y, 23, 24);
        this.context.fillRect(this.x + 2, this.y + 26, 12, 12);

        this.context.fillStyle = DINO_BELLY_COLOR;
        this.context.fillRect(this.x + 14, this.y + 22, 17, 22);

        this.context.fillStyle = DINO_EYE_COLOR;
        this.context.fillRect(this.x + 38, this.y + 7, 4, 4);

        this.context.fillStyle = DINO_COLOR;
        this.context.fillRect(this.x + 12, this.y + 48, 9, 10 + legOffset);
        this.context.fillRect(this.x + 31, this.y + 48, 9, 10 - legOffset);
    }

    reset() {
        this.y = this.groundY - this.height;
        this.vy = 0;
        this.onGround = true;
    }
}
