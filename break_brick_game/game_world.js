let canvas;
let gameWorld;
window.onload = () => {
    "use district";
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth * 0.7
    canvas.height = window.innerHeight * 0.7
    gameWorld = new GameWorld(canvas,2, 5);
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
};

class GameWorld {
    constructor(canvas, numRow, numColumn, bubbleSize = 10, speed = 100) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.gameBoardWidth = this.canvas.width;
        this.gameBoardHeight = this.canvas.height * 0.85;
        this.bubbleSize = bubbleSize;
        this.secondPassed = 0;
        this.oldTimestamp = 0;
        this.speed = speed;
        this.score = 0;
        this.mouseDown = false;
        this.gameOver = false;
        this.numColumn = numColumn;
        this.numRow = numRow;
        this.run = false;

        this.init(numRow, numColumn);
    }

    init(numRow, numColumn) {
        window.addEventListener("touchmove", (e) => {
            if (
                e.targetTouches[0].pageX <
                    this.gameBoardWidth - this.slider.width / 2 &&
                e.targetTouches[0].pageX > this.slider.width / 2
            )
                this.slider.x =
                    e.targetTouches[0].pageX - this.slider.width / 2;
        });

        window.addEventListener("mousedown", (e) => (this.mouseDown = true));
        window.addEventListener("mouseup", (e) => (this.mouseDown = false));

        window.addEventListener("mousemove", (e) => {
            if (!this.mouseDown) {
                this.slider.vx = 0;
            } else if (
                this.slider.x + e.movementX > this.slider.x / 2 &&
                this.slider.x + e.movementX <
                    this.gameBoardWidth - this.slider.width
            ) {
                this.slider.vx = e.movementX;
                this.slider.update();
            }
        });

        this.totalBrick = numColumn * numRow;

        

        //init brick
        let marginHorizontal = numColumn * 5;
        let brickWidth = this.gameBoardWidth / numColumn - marginHorizontal;
        let brickHeight = (this.gameBoardHeight * 0.3) / numRow - numRow;
        this.listBrick = [];
        let x = marginHorizontal;
        let y = 0;
        for (let i = 0; i < numRow; i++) {
            x = marginHorizontal / 2;
            for (let j = 0; j < numColumn; j++) {
                this.listBrick.push(
                    new Brick(this.context, x, y, brickWidth, brickHeight)
                );
                x += brickWidth + marginHorizontal;
            }
            y += brickHeight + numRow * 2;
        }

        

        if(!this.bubble || !this.slider){
            this.speed = brickWidth * 2
            this.bubble = new Bubble(
                this.context,
                this.gameBoardWidth / 2,
                this.gameBoardHeight - this.bubbleSize - brickHeight / 2,
                -this.speed,
                -this.speed,
                this.gameBoardHeight * 0.02
            );
            this.slider = new Slider(
                this.context,
                this.gameBoardWidth / 2 - brickWidth / 2,
                this.gameBoardHeight - this.bubble.radius * 2,
                this.bubble.radius * 12,
                this.bubble.radius * 2
            );
    
            
        }
        this.start();
    }

    gameLoop(timeStamp) {

        let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        if (this.listBrick.length == 0) {
            this.speed += 100;
            this.numRow++;
            this.numColumn++;
            this.init(this.numRow, this.numColumn);
            this.run = false;
            this.bubble.x = this.gameBoardWidth / 2
            this.bubble.y = this.gameBoardHeight / 2
            this.start();
        }

        if (this.gameOver) {
            this.drawButton("Game OVER");
        } else if (this.run) {
            
            this.detectCollisions();
            this.bubble.update(secondsPassed);
            this.draw();
        }

        window.requestAnimationFrame((timeStamp) => this.gameLoop(timeStamp));
    }

    draw() {
        this.clear();
        this.listBrick.forEach((brick) => brick.draw());
        this.bubble.draw();
        this.slider.draw();
        this.drawGameInfo();
    }

    detectCollisions() {
        this.bubble.isColliding = false;
        if (this.bubble.x < this.bubble.radius) {
            this.bubble.vx = Math.abs(this.bubble.vx);
            this.bubble.x = this.bubble.radius;
            this.bubble.isColliding = true;
        } else if (this.bubble.x > this.gameBoardWidth - this.bubble.radius) {
            this.bubble.vx = -Math.abs(this.bubble.vx);
            this.bubble.x = this.gameBoardWidth - this.bubble.radius;
            this.bubble.isColliding = true;
        }

        if (this.bubble.y < this.bubble.radius) {
            this.bubble.vy = Math.abs(this.bubble.vy);
            this.bubble.y = this.bubble.radius;
            this.bubble.isColliding = true;
        }
        let tmp = [];
        for (let i = 0; i < this.listBrick.length; i++) {
            let brick = this.listBrick[i];
            if (
                this.circleRectIntersect(
                    this.bubble.x,
                    this.bubble.y,
                    this.bubble.radius,
                    brick.x,
                    brick.y,
                    brick.width,
                    brick.height
                )
            ) {
                this.bubble.isColliding = true;

                if (
                    this.bubble.x + this.bubble.radius > brick.width ||
                    this.bubble.x - this.bubble.radius < brick.x + brick.width
                ) {
                    this.bubble.vx = this.bubble.vx;
                }

                if (
                    this.bubble.y + this.bubble.radius > brick.height ||
                    this.bubble.y - this.bubble.radius < brick.y + brick.height
                ) {
                    this.bubble.vy = -this.bubble.vy;
                }
                this.score += 10;
            } else tmp.push(brick);
        }
        this.listBrick = tmp;

        if (this.bubble.y > this.slider.y) {
            if (
                this.bubble.x + this.bubble.radius > this.slider.x &&
                this.bubble.x - this.bubble.radius <
                    this.slider.x + this.slider.width
            ) {
                this.getDirectionCollision(this.slider);
                this.bubble.vy = -this.bubble.vy;
            } else {
                // alert("Game over");

                this.bubble.y -= this.bubble.radius;
                this.bubble.vx = 0;
                this.bubble.vy = 0;
                this.gameOver = true;
            }
        }
    }

    getDirectionCollision(brick) {
        var vector = {
            x: this.bubble.vx + (this.bubble.x - (brick.x + brick.width/2)),
            y: this.bubble.vy,
        };
        var distance = Math.sqrt(vector.x*2 * vector.x*2 + vector.y * vector.y);
        let cosPhi = vector.x / distance;
        let sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
        this.bubble.vx = cosPhi * this.speed * 1.5;
        this.bubble.vy = sinPhi * this.speed * 1.5;
    }

    circleRectIntersect(cx, cy, r, rx, ry, w, h) {
        if (cx + r < rx || cx - r > rx + w || cy + r < ry || cy - r > ry + h)
            return false;
        return true;
    }

    drawGameInfo() {
        let x = 0;
        let y = this.gameBoardHeight + 2;
        let width = this.gameBoardWidth;
        this.context.beginPath();
        this.context.fillStyle = "#d8d8d8";
        this.context.moveTo(0, y);
        this.context.lineTo(width, y);
        this.context.lineWidth = 0.3;
        this.context.stroke();

        this.context.textAlign = "left";

        let textSize = 12;
        this.context.fillStyle = "#3F7CF6";
        this.context.font = `${textSize}px Arial`;
        this.context.fillText(`Speed: ${this.speed}`, x + 10, y + textSize + 5);

        this.context.fillText(
            `Score: ${this.score}`,
            width - 65,
            y + textSize + 5
        );
    }

    drawButton(text) {
        // this.clear();
        let x = this.gameBoardWidth / 6;
        let y = this.gameBoardHeight / 4;
        let width = this.gameBoardWidth * 0.67;
        let height = this.gameBoardHeight * 0.6;
        this.context.fillStyle = "#3AAFFD";
        this.context.fillRect(x, y, width, height);

        this.context.font = "20px Arial";
        this.context.textAlign = "center";
        this.context.fillStyle = "#ffffff";
        this.context.fillText(text, x + width / 2, y + height / 2);
    }

    start() {
        let i = 3;
        let interval = setInterval(() => {
            this.drawButton(`Start in ${i--}...`);
        }, 1000);

        setTimeout(() => {
            clearInterval(interval);
            this.run = true;
            this.timeStamp = 0;
        }, 3500);
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
