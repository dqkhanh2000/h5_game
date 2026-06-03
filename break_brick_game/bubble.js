class Bubble extends GameObject {
    constructor(context, x, y, vx, vy, radius, color = "#2427EF") {
        super(context, x, y, vx, vy);
        this.radius = radius;
        this.color = color;
        this.isColliding = false;
    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = this.isColliding ? "#ff8080" : this.color;
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();
    }

    reset(x, y, speed) {
        this.x = x;
        this.y = y;
        this.vx = -speed;
        this.vy = -speed;
        this.isColliding = false;
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
