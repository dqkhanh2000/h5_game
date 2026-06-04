class Bubble extends GameObject {

    constructor(context, x, y, speed, radius, color = "#f8fafc") {
        super(context, x, y, 1, -1);
        this.radius = radius;
        this.color = color;
        this.isColliding = false;
        this.speed = speed;
    }

    draw() {
        let glowColor = this.isColliding ? "rgba(251, 113, 133, 0.65)" : "rgba(125, 211, 252, 0.55)";

        this.context.save();
        this.context.beginPath();
        this.context.fillStyle = this.isColliding ? "#fb7185" : this.color;
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    }

    reset(x, y) {
        this.x = x;
        this.y = y;
        this.isColliding = false;
    }

    set speed(speed) {
        let angle = Math.atan2(this.vy, this.vx);
        this.vx = speed * Math.cos(angle);
        this.vy = speed * Math.sin(angle);
    }

    get speed() {
        return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    }

    stop() {
        this.vx = 0;
        this.vy = 0;
    }

    bounceX(direction) {
        this.vx = Math.abs(this.vx) * direction;
        this.isColliding = true;
    }

    bounceY(direction) {
        this.vy = Math.abs(this.vy) * direction;
        this.isColliding = true;
    }

    bounceInsideWalls(width, height) {
        if (this.x < this.radius) {
            this.x = this.radius;
            this.bounceX(1);
        } else if (this.x > width - this.radius) {
            this.x = width - this.radius;
            this.bounceX(-1);
        }

        if (this.y < this.radius) {
            this.y = this.radius;
            this.bounceY(1);
        }
    }

    isBelow(y) {
        return this.y + this.radius > y;
    }
}
