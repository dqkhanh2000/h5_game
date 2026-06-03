class GameObject {
    constructor(context, x, y, vx = 0, vy = 0) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
    }

    update(secondsPassed = 1) {
        if (isNaN(this.vx * secondsPassed) || isNaN(this.vy * secondsPassed)) {
            return;
        }

        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }

    draw() {
    }
}
