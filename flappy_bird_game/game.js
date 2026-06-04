let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = 480;
    canvas.height = 640;

    gameWorld = new Game(canvas);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
};

const SKY_COLOR = "#7dd3fc";
const GROUND_COLOR = "#84cc16";
const GROUND_HEIGHT = 80;
const PIPE_WIDTH = 72;
const PIPE_GAP = 170;
const PIPE_SPEED = 160;
const PIPE_SPAWN_TIME = 1.45;

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");

        this.width = canvas.width;
        this.height = canvas.height;
        this.groundY = this.height - GROUND_HEIGHT;
        this.ui = new GameUI(this.context, this.width, this.height);

        this.score = 0;
        this.gameOver = false;
        this.started = false;
        this.oldTimeStamp = 0;
        this.pipeTimer = 0;
        this.pipeList = [];

        this.createActors();
        this.listenForPlayerInput();
        this.draw();
        this.ui.drawMessage("Flappy Bird", "Press Space or click to flap");
    }

    createActors() {
        let birdSize = 34;
        this.bird = new Bird(
            this.context,
            this.width * 0.25,
            this.height * 0.4,
            birdSize
        );
    }

    listenForPlayerInput() {
        window.addEventListener("keydown", (event) => {
            if (event.code === "Space") {
                event.preventDefault();
                this.playerFlap();
            }
        });

        window.addEventListener("mousedown", () => this.playerFlap());
        window.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this.playerFlap();
        }, { passive: false });
    }

    playerFlap() {
        if (this.gameOver) {
            this.restart();
            return;
        }

        if (!this.started) {
            this.oldTimeStamp = performance.now();
        }

        this.started = true;
        this.bird.flap();
    }

    gameLoop(timeStamp) {
        let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000 || 0;
        secondsPassed = Math.min(secondsPassed, 0.05);
        this.oldTimeStamp = timeStamp;

        if (this.started && !this.gameOver) {
            this.update(secondsPassed);
        }

        this.draw();

        if (!this.started) {
            this.ui.drawMessage("Flappy Bird", "Press Space or click to flap");
        } else if (this.gameOver) {
            this.ui.drawMessage("Game Over", "Press Space or click to restart");
        }

        window.requestAnimationFrame((nextTimeStamp) => this.gameLoop(nextTimeStamp));
    }

    update(secondsPassed) {
        this.bird.update(secondsPassed);
        this.spawnPipes(secondsPassed);
        this.updatePipes(secondsPassed);
        this.checkCollision();
    }

    spawnPipes(secondsPassed) {
        this.pipeTimer += secondsPassed;

        if (this.pipeTimer < PIPE_SPAWN_TIME) {
            return;
        }

        this.pipeTimer = 0;

        let minGapY = 80;
        let maxGapY = this.groundY - PIPE_GAP - 80;
        let gapY = minGapY + Math.random() * (maxGapY - minGapY);

        this.pipeList.push(
            new PipePair(
                this.context,
                this.width,
                PIPE_WIDTH,
                gapY,
                PIPE_GAP,
                PIPE_SPEED,
                this.groundY
            )
        );
    }

    updatePipes(secondsPassed) {
        for (let pipe of this.pipeList) {
            pipe.update(secondsPassed);

            if (pipe.hasPassed(this.bird)) {
                pipe.scored = true;
                this.score++;
            }
        }

        this.pipeList = this.pipeList.filter((pipe) => !pipe.isOffScreen());
    }

    checkCollision() {
        let hitCeiling = this.bird.y < 0;
        let hitGround = this.bird.y + this.bird.height > this.groundY;
        let hitPipe = this.pipeList.some((pipe) => pipe.touchesBird(this.bird));

        if (hitCeiling || hitGround || hitPipe) {
            this.gameOver = true;
        }
    }

    restart() {
        this.score = 0;
        this.gameOver = false;
        this.started = false;
        this.pipeTimer = 0;
        this.pipeList = [];
        this.bird.reset(this.width * 0.25, this.height * 0.4);
    }

    draw() {
        this.drawBackground();
        this.pipeList.forEach((pipe) => pipe.draw());
        this.bird.draw();
        this.drawGround();
        this.ui.drawScore(this.score);
    }

    drawBackground() {
        this.context.fillStyle = SKY_COLOR;
        this.context.fillRect(0, 0, this.width, this.height);

        this.context.fillStyle = "rgba(255, 255, 255, 0.85)";
        this.context.beginPath();
        this.context.arc(95, 110, 22, 0, Math.PI * 2);
        this.context.arc(120, 108, 30, 0, Math.PI * 2);
        this.context.arc(150, 112, 20, 0, Math.PI * 2);
        this.context.fill();
    }

    drawGround() {
        this.context.fillStyle = GROUND_COLOR;
        this.context.fillRect(0, this.groundY, this.width, GROUND_HEIGHT);

        this.context.fillStyle = "#65a30d";
        this.context.fillRect(0, this.groundY, this.width, 12);
    }
}
