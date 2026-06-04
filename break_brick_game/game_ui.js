class GameUI {
    constructor(context, width, gameBoardHeight) {
        this.context = context;
        this.width = width;
        this.gameBoardHeight = gameBoardHeight;
    }

    drawGameInfo(score, speed) {
        let textSize = 12;
        let y = this.gameBoardHeight + 2;

        this.context.beginPath();
        this.context.fillStyle = "#d8d8d8";
        this.context.moveTo(0, y);
        this.context.lineTo(this.width, y);
        this.context.lineWidth = 0.3;
        this.context.stroke();

        this.context.textAlign = "left";
        this.context.fillStyle = "#3F7CF6";
        this.context.font = `${textSize}px Arial`;
        this.context.fillText(`Speed: ${parseInt(speed)}`, 10, y + textSize + 5);
        this.context.fillText(`Score: ${score}`, this.width - 65, y + textSize + 5);
    }

    drawMessage(text) {
        let x = this.width / 6;
        let y = this.gameBoardHeight / 4;
        let width = this.width * 0.67;
        let height = this.gameBoardHeight * 0.6;

        this.context.fillStyle = "#3AAFFD";
        this.context.fillRect(x, y, width, height);

        this.context.font = "20px Arial";
        this.context.textAlign = "center";
        this.context.fillStyle = "#ffffff";
        this.context.fillText(text, x + width / 2, y + height / 2);
    }
}
