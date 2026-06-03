class Brick extends GameObject {
    constructor(context, x, y, width, height, color = "#8FFF8B") {
        super(context, x, y);
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    isTouchingBubble(bubble) {
        return !(
            bubble.x + bubble.radius < this.x ||
            bubble.x - bubble.radius > this.x + this.width ||
            bubble.y + bubble.radius < this.y ||
            bubble.y - bubble.radius > this.y + this.height
        );
    }
}
