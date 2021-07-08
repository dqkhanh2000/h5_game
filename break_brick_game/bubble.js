class Bubble{
    constructor(context, x, y, vx, vy, radius, color = "#2427EF"){
        this.context = context
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
        this.radius = radius
        this.color = color
        this.isColliding = false
    }

    draw(){
        this.context.beginPath()
        this.context.fillStyle = this.isColliding ? '#ff8080' : this.color
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        this.context.fill()
    }

    update(secondsPassed){
        if(isNaN(this.vx * secondsPassed))
            return
        this.x += this.vx * secondsPassed
        this.y += this.vy * secondsPassed
    }
}