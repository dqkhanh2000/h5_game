class Slider extends Brick{
    constructor(context, x, y, width, height, color = '#8BA0FF'){
        super(context, x, y, width, height, color)
        this.vx = 0
    }

    update(){
        this.x += this.vx
    }
}