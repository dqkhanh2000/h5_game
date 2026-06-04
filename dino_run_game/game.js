let canvas;
let gameWorld;

window.onload = () => {
    "use strict";

    canvas = document.getElementById("canvas");
    canvas.width = 900;
    canvas.height = 420;

    gameWorld = new Game(canvas);
    window.gameWorld = gameWorld;
    window.requestAnimationFrame((timeStamp) => gameWorld.gameLoop(timeStamp));
};

const SKY_COLOR = "#f8fafc";
const CLOUD_COLOR = "#e2e8f0";
const GROUND_COLOR = "#64748b";
const GROUND_Y = 330;
const START_SPEED = 260;
const MAX_SPEED = 650;
const SPEED_INCREMENT = 8;

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.ui = new GameUI(canvas);

        this.score = 0;
        this.speed = START_SPEED;
        this.run = false;
        this.gameOver = false;
        this.oldTimeStamp = 0;
        this.spawnTimer = 0;
        this.nextSpawnTime = 1.2;
        this.obstacles = [];
        this.cloudX = this.width * 0.75;

        this.createActors();
        this.listenForPlayerInput();
        this.draw();
        this.showStart();
    }

    createActors() {
        this.dino = new Dino(this.context, 92, GROUND_Y);
    }

    listenForPlayerInput() {
        window.addEventListener("keydown", (event) => {
            if (event.code === "Space") {
                event.preventDefault();
                this.handleAction();
            }
        });

        this.canvas.addEventListener("mousedown", () => this.handleAction());
        this.canvas.addEventListener("touchstart", (event) => {
            event.preventDefault();
            this.handleAction();
        }, { passive: false });
    }

    handleAction() {
        if (!this.run || this.gameOver) {
            return;
        }

        this.dino.jump();
    }

    gameLoop(timeStamp) {
        let secondsPassed = (timeStamp - this.oldTimeStamp) / 1000 || 0;
        secondsPassed = Math.min(secondsPassed, 0.05);
        this.oldTimeStamp = timeStamp;

        if (this.run) {
            this.update(secondsPassed);
        }

        this.draw();
        window.requestAnimationFrame((nextTimeStamp) => this.gameLoop(nextTimeStamp));
    }

    update(secondsPassed) {
        this.speed = Math.min(this.speed + SPEED_INCREMENT * secondsPassed, MAX_SPEED);
        this.dino.update(secondsPassed);
        this.spawnObstacle(secondsPassed);
        this.updateObstacles(secondsPassed);
        this.updateCloud(secondsPassed);
        this.checkCollision();
    }

    spawnObstacle(secondsPassed) {
        this.spawnTimer += secondsPassed;

        if (this.spawnTimer < this.nextSpawnTime) {
            return;
        }

        this.spawnTimer = 0;
        this.nextSpawnTime = 0.85 + Math.random() * 0.9;
        this.obstacles.push(new Obstacle(this.context, this.width + 20, GROUND_Y, this.speed));
    }

    updateObstacles(secondsPassed) {
        for (let obstacle of this.obstacles) {
            obstacle.vx = -this.speed;
            obstacle.update(secondsPassed);

            if (obstacle.hasPassed(this.dino)) {
                obstacle.scored = true;
                this.score++;
            }
        }

        this.obstacles = this.obstacles.filter((obstacle) => !obstacle.isOffScreen());
    }

    updateCloud(secondsPassed) {
        this.cloudX -= this.speed * 0.2 * secondsPassed;

        if (this.cloudX < -90) {
            this.cloudX = this.width + 80;
        }
    }

    checkCollision() {
        for (let obstacle of this.obstacles) {
            if (this.dino.isTouching(obstacle)) {
                this.gameOver = true;
                this.run = false;
                this.showGameOver();
            }
        }
    }

    start() {
        this.run = true;
        this.gameOver = false;
        this.oldTimeStamp = performance.now();
        this.ui.hideMessage();
    }

    restart() {
        this.score = 0;
        this.speed = START_SPEED;
        this.run = true;
        this.gameOver = false;
        this.spawnTimer = 0;
        this.nextSpawnTime = 1.2;
        this.obstacles = [];
        this.dino.reset();
        this.oldTimeStamp = performance.now();
        this.ui.hideMessage();
    }

    showStart() {
        this.ui.showMessage("Dino Run", "Start", () => this.start());
    }

    showGameOver() {
        this.ui.showMessage("Game Over", "Restart", () => this.restart());
    }

    draw() {
        this.clear();
        this.drawBackground();
        this.obstacles.forEach((obstacle) => obstacle.draw());
        this.dino.draw();
        this.ui.updateGameInfo(this.score, this.speed);
    }

    drawBackground() {
        this.context.fillStyle = SKY_COLOR;
        this.context.fillRect(0, 0, this.width, this.height);

        this.drawCloud(this.cloudX, 82);
        this.drawCloud(this.cloudX - 430, 116);

        this.context.strokeStyle = GROUND_COLOR;
        this.context.lineWidth = 3;
        this.context.beginPath();
        this.context.moveTo(0, GROUND_Y);
        this.context.lineTo(this.width, GROUND_Y);
        this.context.stroke();

        this.context.fillStyle = "rgba(100, 116, 139, 0.4)";
        for (let x = 0; x < this.width; x += 36) {
            let offsetX = (x - (this.speed * performance.now() / 1000) % 36);
            this.context.fillRect(offsetX, GROUND_Y + 18, 18, 3);
        }
    }

    drawCloud(x, y) {
        this.context.fillStyle = CLOUD_COLOR;
        this.context.beginPath();
        this.context.arc(x, y, 18, 0, Math.PI * 2);
        this.context.arc(x + 22, y - 8, 24, 0, Math.PI * 2);
        this.context.arc(x + 52, y, 18, 0, Math.PI * 2);
        this.context.fill();
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }
}
