class Brick{
    constructor(context, x, y, width, height, color = '#8FFF8B'){
        this.context = context
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
    }

    draw(){
        this.context.fillStyle = this.color
        this.context.fillRect(this.x, this.y, this.width, this.height)
    }

}