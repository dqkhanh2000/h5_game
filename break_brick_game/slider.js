class Slider extends Brick {
    constructor(context, x, y, width, height, color = '#8BA0FF') {
        super(context, x, y, width, height, color)
    }

    stop() {
        this.vx = 0;
    }

    moveBy(distance, minX, maxX) {
        this.vx = distance;
        this.update();
        this.keepInside(minX, maxX);
    }

    moveToCenter(centerX, minX, maxX) {
        this.x = centerX - this.width / 2;
        this.keepInside(minX, maxX);
    }

    keepInside(minX, maxX) {
        if (this.x < minX) {
            this.x = minX;
        } else if (this.x > maxX) {
            this.x = maxX;
        }
    }

    isTouchingBubble(bubble) {
        return (
            bubble.y + bubble.radius >= this.y &&
            bubble.x + bubble.radius > this.x &&
            bubble.x - bubble.radius < this.x + this.width
        );
    }

    bounceBubble(bubble) {
        bubble.vy = -Math.abs(bubble.vy);
        bubble.isColliding = true;
    }
}
