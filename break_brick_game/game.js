let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = 900;
    canvas.height = 620;

    gameWorld = new Game(canvas, 5, 5);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
};

const BRICK_COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#fb7185", "#a78bfa"];
const BUBBLE_SIZE = 10;
const START_SPEED = 200;
const SPEED_INCREMENT = 50;
const MAX_SPEED = 1000;

class Game {
    constructor(canvas, numRow, numColumn, bubbleSize = BUBBLE_SIZE) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.gameBoardWidth = this.canvas.width;
        this.gameBoardHeight = this.canvas.height;
        this.ui = new GameUI(this.canvas);
        this.bubbleSize = bubbleSize;

        this.score = 0;
        this.numRow = numRow;
        this.numColumn = numColumn;
        this.mouseDown = false;
        this.gameOver = false;
        this.run = false;
        this.messageText = "";
        this.buttonText = "";
        this.oldTimeStamp = 0;

        this.createActors();
        this.createBricks();
        this.listenForPlayerInput();
        this.draw();
        this.showMessage("Ready?", "Start");
    }

    createActors() {
        let bubbleRadius = this.gameBoardHeight * 0.02;
        let sliderWidth = this.gameBoardWidth * 0.2;
        let sliderHeight = bubbleRadius * 2;

        this.bubble = new Bubble(
            this.context,
            this.gameBoardWidth / 2,
            this.gameBoardHeight / 2,
            START_SPEED,
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
        let topPadding = 24;
        let margin = 12;
        let brickWidth = this.gameBoardWidth / this.numColumn - margin;
        let brickHeight = (this.gameBoardHeight * 0.3) / this.numRow - this.numRow;

        this.listBrick = [];

        for (let row = 0; row < this.numRow; row++) {
            for (let column = 0; column < this.numColumn; column++) {
                let x = margin / 2 + column * (brickWidth + margin);
                let y = topPadding + row * (brickHeight + this.numRow * 2);
                let color = BRICK_COLORS[row % BRICK_COLORS.length];

                this.listBrick.push(
                    new Brick(this.context, x, y, brickWidth, brickHeight, color)
                );
            }
        }
    }

    listenForPlayerInput() {
        window.addEventListener("touchmove", (event) => {
            if (!this.run || this.gameOver) {
                return;
            }

            let touch = event.targetTouches[0];
            this.slider.moveToCenter(this.canvasX(touch.clientX), 0, this.maxSliderX());
        });

        window.addEventListener("mousedown", (event) => {
            if (!this.run || this.gameOver) {
                return;
            }

            this.mouseDown = true;
            this.slider.moveToCenter(this.canvasX(event.clientX), 0, this.maxSliderX());
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

            if (!this.run || this.gameOver) {
                return;
            }

            this.slider.moveToCenter(this.canvasX(event.clientX), 0, this.maxSliderX());
        });
    }

    gameLoop(timeStamp) {
        let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000;
        this.oldTimeStamp = timeStamp;

        if (this.run) {
            this.update(secondsPassed);
        }

        this.draw();

        if (this.gameOver) {
            this.showMessage("Game Over", "Restart");
        } else if (!this.run) {
            this.showMessage("Ready?", "Start");
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
                this.bubble.speed = Math.min(this.bubble.speed + SPEED_INCREMENT, MAX_SPEED);
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
        this.run = false;
    }

    nextLevel() {
        this.numRow++;
        this.numColumn++;
        this.run = false;

        this.createBricks();
        this.bubble.reset(this.gameBoardWidth / 2, this.gameBoardHeight / 2);
    }

    draw() {
        this.clear();
        this.drawBackground();
        this.listBrick.forEach((brick) => brick.draw());
        this.bubble.draw();
        this.slider.draw();
        this.ui.updateGameInfo(this.score, this.bubble.speed);
    }

    showMessage(text, buttonText) {
        if (this.messageText === text && this.buttonText === buttonText) {
            return;
        }

        this.messageText = text;
        this.buttonText = buttonText;
        this.ui.showMessage(text);
        this.ui.showButton(buttonText, () => {
            if (this.gameOver) {
                this.restart();
                this.start();
                return;
            }

            this.start();
        });
    }

    start() {
        this.run = true;
        this.messageText = "";
        this.buttonText = "";
        this.ui.hideMessage();
        this.oldTimeStamp = performance.now();
    }

    restart() {
        this.score = 0;
        this.numRow = 5;
        this.numColumn = 5;
        this.gameOver = false;
        this.run = false;

        this.createActors();
        this.createBricks();
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        this.context.fillStyle = "#111827";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.context.fillStyle = "rgba(125, 211, 252, 0.08)";
        for (let x = 0; x < this.gameBoardWidth; x += 44) {
            this.context.fillRect(x, 0, 1, this.gameBoardHeight);
        }

        for (let y = 0; y < this.gameBoardHeight; y += 44) {
            this.context.fillRect(0, y, this.gameBoardWidth, 1);
        }
    }

    maxSliderX() {
        return this.gameBoardWidth - this.slider.width;
    }

    canvasX(clientX) {
        let rect = this.canvas.getBoundingClientRect();
        let scaleX = this.canvas.width / rect.width;
        return (clientX - rect.left) * scaleX;
    }
}
