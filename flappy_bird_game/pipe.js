const PIPE_COLOR = "#22c55e";
const PIPE_DARK_COLOR = "#15803d";

class PipePair {
    constructor(context, x, width, gapY, gapHeight, speed, boardHeight) {
        this.context = context;
        this.x = x;
        this.width = width;
        this.gapY = gapY;
        this.gapHeight = gapHeight;
        this.speed = speed;
        this.boardHeight = boardHeight;
        this.scored = false;
    }

    update(secondsPassed) {
        this.x -= this.speed * secondsPassed;
    }

    draw() {
        this.drawPipe(0, this.gapY);
        this.drawPipe(this.gapY + this.gapHeight, this.boardHeight - this.gapY - this.gapHeight);
    }

    drawPipe(y, height) {
        this.context.fillStyle = PIPE_COLOR;
        this.context.fillRect(this.x, y, this.width, height);

        this.context.fillStyle = PIPE_DARK_COLOR;
        this.context.fillRect(this.x, y, 8, height);

        let capHeight = 18;
        let capY = y === 0 ? height - capHeight : y;
        this.context.fillStyle = PIPE_DARK_COLOR;
        this.context.fillRect(this.x - 6, capY, this.width + 12, capHeight);
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }

    hasPassed(bird) {
        return !this.scored && this.x + this.width < bird.x;
    }

    touchesBird(bird) {
        let birdRight = bird.x + bird.width;
        let birdBottom = bird.y + bird.height;
        let insidePipeX = birdRight > this.x && bird.x < this.x + this.width;
        let outsideGap = bird.y < this.gapY || birdBottom > this.gapY + this.gapHeight;

        return insidePipeX && outsideGap;
    }
}
