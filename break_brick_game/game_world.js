let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.7;

    gameWorld = new GameWorld(canvas, 5, 5);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
};

class GameWorld {
    constructor(canvas, numRow, numColumn, bubbleSize = 10, speed = 200) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.gameBoardWidth = this.canvas.width;
        this.gameBoardHeight = this.canvas.height - 30;
        this.bubbleSize = bubbleSize;
        this.speed = speed;

        this.score = 0;
        this.numRow = numRow;
        this.numColumn = numColumn;
        this.mouseDown = false;
        this.gameOver = false;
        this.run = false;
        this.oldTimeStamp = 0;

        this.createActors();
        this.createBricks();
        this.listenForPlayerInput();
        this.start();
    }

    createActors() {
        let bubbleRadius = this.gameBoardHeight * 0.02;
        let sliderWidth = this.gameBoardWidth * 0.2;
        let sliderHeight = bubbleRadius * 2;

        this.bubble = new Bubble(
            this.context,
            this.gameBoardWidth / 2,
            this.gameBoardHeight / 2,
            -this.speed,
            -this.speed,
            bubbleRadius
        );

        this.slider = new Slider(
            this.context,
            this.gameBoardWidth / 2 - sliderWidth / 2,
            this.gameBoardHeight - sliderHeight,
            sliderWidth,
            sliderHeight
        );
    }

    createBricks() {
        let margin = this.numColumn * 5;
        let brickWidth = this.gameBoardWidth / this.numColumn - margin;
        let brickHeight = (this.gameBoardHeight * 0.3) / this.numRow - this.numRow;

        this.listBrick = [];

        for (let row = 0; row < this.numRow; row++) {
            for (let column = 0; column < this.numColumn; column++) {
                let x = margin / 2 + column * (brickWidth + margin);
                let y = row * (brickHeight + this.numRow * 2);

                this.listBrick.push(
                    new Brick(this.context, x, y, brickWidth, brickHeight)
                );
            }
        }
    }

    listenForPlayerInput() {
        window.addEventListener("touchmove", (event) => {
            let touch = event.targetTouches[0];
            this.slider.moveToCenter(touch.pageX, 0, this.maxSliderX());
        });

        window.addEventListener("mousedown", () => {
            this.mouseDown = true;
        });

        window.addEventListener("mouseup", () => {
            this.mouseDown = false;
            this.slider.stop();
        });

        window.addEventListener("mousemove", (event) => {
            if (!this.mouseDown) {
                this.slider.stop();
                return;
            }

            this.slider.moveBy(event.movementX, 0, this.maxSliderX());
        });
    }

    gameLoop(timeStamp) {
        let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        if (this.gameOver) {
            this.drawButton("Game OVER");
        } else if (this.run) {
            this.update(secondsPassed);
            this.draw();
        }

        window.requestAnimationFrame((nextTimeStamp) => this.gameLoop(nextTimeStamp));
    }

    update(secondsPassed) {
        if (this.listBrick.length === 0) {
            this.nextLevel();
            return;
        }

        this.bubble.isColliding = false;
        this.bubble.update(secondsPassed);
        this.bubble.bounceInsideWalls(this.gameBoardWidth, this.gameBoardHeight);

        this.checkBubbleHitBricks();
        this.hitSliderOrLose();
    }

    checkBubbleHitBricks() {

        for (let i = 0; i < this.listBrick.length; i++) {
            let brick = this.listBrick[i];

            if (brick.isTouchingBubble(this.bubble)) {
                this.bubble.bounceY(this.bubble.vy > 0 ? -1 : 1);
                this.score += 10;
                this.listBrick.splice(i--, 1);
            }
        }
    }

    hitSliderOrLose() {
        if (!this.bubble.isBelow(this.slider.y)) {
            return;
        }

        if (this.slider.isTouchingBubble(this.bubble)) {
            this.slider.bounceBubble(this.bubble);
            return;
        }

        this.bubble.stop();
        this.gameOver = true;
    }

    nextLevel() {
        this.speed += 100;
        this.numRow++;
        this.numColumn++;
        this.run = false;

        this.createBricks();
        this.bubble.reset(this.gameBoardWidth / 2, this.gameBoardHeight / 2, this.speed);
        this.start();
    }

    draw() {
        this.clear();
        this.listBrick.forEach((brick) => brick.draw());
        this.bubble.draw();
        this.slider.draw();
        this.drawGameInfo();
    }

    drawGameInfo() {
        let textSize = 12;
        let y = this.gameBoardHeight + 2;

        this.context.beginPath();
        this.context.fillStyle = "#d8d8d8";
        this.context.moveTo(0, y);
        this.context.lineTo(this.gameBoardWidth, y);
        this.context.lineWidth = 0.3;
        this.context.stroke();

        this.context.textAlign = "left";
        this.context.fillStyle = "#3F7CF6";
        this.context.font = `${textSize}px Arial`;
        this.context.fillText(`Speed: ${parseInt(this.speed)}`, 10, y + textSize + 5);
        this.context.fillText(`Score: ${this.score}`, this.gameBoardWidth - 65, y + textSize + 5);
    }

    drawButton(text) {
        this.clear();

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
        let count = 3;
        this.drawButton(`Start in ${count}...`);

        let interval = setInterval(() => {
            count--;

            if (count >= 0) {
                this.drawButton(`Start in ${count}s...`);
            }
            else {
                clearInterval(interval);
                this.run = true;
                this.oldTimeStamp = performance.now();
            }
        }, 1000);
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    maxSliderX() {
        return this.gameBoardWidth - this.slider.width;
    }
}
