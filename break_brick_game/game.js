let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth * 0.7;
    canvas.height = window.innerHeight * 0.7;

    gameWorld = new Game(canvas, 5, 5);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
};

const BRICK_COLOR = "#0095DD";
const SLIDER_COLOR = "#0095DD";
const BUBBLE_COLOR = "#0095DD";
const UI_COLOR = "#0095DD";
const MESSAGE_COLOR = "#0095DD";
const UI_SCORE_SIZE = 30;
const BUBBLE_SIZE = 10;
const START_SPEED = 200;
const SPEED_INCREMENT = 50;
const MAX_SPEED = 1000;

class Game {
    constructor(canvas, numRow, numColumn, bubbleSize = BUBBLE_SIZE) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.gameBoardWidth = this.canvas.width;
        this.gameBoardHeight = this.canvas.height - UI_SCORE_SIZE;
        this.ui = new GameUI(this.context, this.gameBoardWidth, this.gameBoardHeight);
        this.bubbleSize = bubbleSize;

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
            this.showMessage("Game OVER");
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
    }

    nextLevel() {
        this.numRow++;
        this.numColumn++;
        this.run = false;

        this.createBricks();
        this.bubble.reset(this.gameBoardWidth / 2, this.gameBoardHeight / 2);
        this.start();
    }

    draw() {
        this.clear();
        this.listBrick.forEach((brick) => brick.draw());
        this.bubble.draw();
        this.slider.draw();
        this.ui.drawGameInfo(this.score, this.bubble.speed);
    }

    showMessage(text) {
        this.clear();
        this.ui.drawMessage(text);
    }

    start() {
        let count = 3;
        this.showMessage(`Start in ${count}...`);

        let interval = setInterval(() => {
            count--;

            if (count >= 0) {
                this.showMessage(`Start in ${count}s...`);
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
