class Brick extends GameObject {
    constructor(context, x, y, width, height, color = "#38bdf8") {
        super(context, x, y);
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        this.context.save();
        this.context.fillStyle = this.color;
        this.context.beginPath();
        this.context.roundRect(this.x, this.y, this.width, this.height, 6);
        this.context.fill();
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
