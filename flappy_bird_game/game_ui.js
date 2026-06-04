class GameUI {
    constructor(context, width, height) {
        this.context = context;
        this.width = width;
        this.height = height;
    }

    drawScore(score) {
        this.context.fillStyle = "#ffffff";
        this.context.strokeStyle = "#111827";
        this.context.lineWidth = 4;
        this.context.font = "bold 36px Arial";
        this.context.textAlign = "center";
        this.context.strokeText(score, this.width / 2, 54);
        this.context.fillText(score, this.width / 2, 54);
    }

    drawMessage(title, subtitle) {
        let boxWidth = this.width * 0.78;
        let boxHeight = 150;
        let x = (this.width - boxWidth) / 2;
        let y = this.height / 2 - boxHeight / 2;

        this.context.fillStyle = "rgba(17, 24, 39, 0.82)";
        this.context.fillRect(x, y, boxWidth, boxHeight);

        this.context.fillStyle = "#ffffff";
        this.context.textAlign = "center";
        this.context.font = "bold 28px Arial";
        this.context.fillText(title, this.width / 2, y + 56);

        this.context.font = "16px Arial";
        this.context.fillText(subtitle, this.width / 2, y + 96);
    }
}
