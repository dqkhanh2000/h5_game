let gameObjects;
let canvas;
let context;
let secondsPassed = 0;
let oldTimeStamp = 0;
const g = 9.81;
const restitution = 0.90;

window.onload = init

function init(){
    'use district';
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');

    createWorld();
    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp)
{
    secondsPassed = (timeStamp - oldTimeStamp) / 1000;
    oldTimeStamp = timeStamp;

    // Loop over all game objects
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].update(secondsPassed);
    }

    clearCanvas();
    detectCollisions();

    // Do the same to draw
    for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].draw();
    }

    window.requestAnimationFrame(gameLoop);
}

function clearCanvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);

}

function createWorld(){
    gameObjects = [
        new Circle(context, 250, 50, 0, 500, 10),
        new Circle(context, 250, 300, 0, -500, 20),
        new Circle(context, 150, 0, 50, 1000, 10),
        new Circle(context, 250, 150, 50, 50, 30),
        new Circle(context, 350, 75, -50, 50, 10),
        new Circle(context, 300, 300, 50, -50, 10),
        new Circle(context, 10, 300, 50, -50, 10),
        new Circle(context, 300, 10, 50, -50, 10),
        new Circle(context, 50, 300, 50, -50, 10),
        new Circle(context, 260, 50, 0, 500, 10),
        new Circle(context, 250, 200, 0, -500, 20),
        new Circle(context, 150, 0, 40, 100, 10),
        new Circle(context, 250, 110, 50, 50, 30),
        new Circle(context, 10, 95, -50, 50, 10),
        new Circle(context, 40, 300, 50, -50, 10),
        new Circle(context, 10, 50, 50, -50, 10),
    ];
}

class GameObject{
    constructor (context, x, y, vx, vy){
        this.context = context;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        this.isColliding = false;
    }
}

class Circle extends GameObject{
    constructor (context, x, y, vx, vy, radius = 20){
        super(context, x, y, vx, vy);

        // Set default width and height
        this.radius = radius;
        this.isColliding = false;
        this.mass = radius * 2;
        this.restitution = 1;
    }

    draw(){
        // Draw a simple square
        this.context.beginPath();
        this.context.fillStyle = this.isColliding?'#ff8080':'#0099b0';
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.fill();

        context.beginPath();
        context.moveTo(this.x, this.y);
        context.lineTo(this.x + this.radius*Math.cos(this.radians), this.y + this.radius*Math.sin(this.radians));
        context.stroke();
    }

    update(secondsPassed){
        // Move with set velocity
        this.vy += g * this.mass * secondsPassed;
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;

        // Calculate the angle (vy before vx)
        this.radians = Math.atan2(this.vy, this.vx);

        // Convert to degrees
        // this.degrees = 180 * radians / Math.PI;
    }
}

class Square extends GameObject{
    constructor (context, x, y, vx, vy){
        super(context, x, y, vx, vy);

        // Set default width and height
        this.width = 50;
        this.height = 50;
    }

    draw(){
        // Draw a simple square
        this.context.fillStyle = this.isColliding?'#ff8080':'#0099b0';
        this.context.fillRect(this.x, this.y, this.width, this.height);
    }

    update(secondsPassed){
        // Move with set velocity
        this.x += this.vx * secondsPassed;
        this.y += this.vy * secondsPassed;
    }
}

function detectCollisions(){
    let obj1;
    let obj2;

    // Reset collision state of all objects
    for (let i = 0; i < gameObjects.length; i++) {
        let obj = gameObjects[i];
        obj.isColliding = false;
        // Check for left and right
        if (obj.x < obj.radius){
            obj.vx = Math.abs(obj.vx) * restitution;
            obj.x = obj.radius;
        }else if (obj.x > canvas.width - obj.radius){
            obj.vx = -Math.abs(obj.vx) * restitution;
            obj.x = canvas.width - obj.radius;
        }

        // Check for bottom and top
        if (obj.y < obj.radius){
            obj.vy = Math.abs(obj.vy) * restitution;
            obj.y = obj.radius;
        } else if (obj.y > canvas.height - obj.radius){
            obj.vy = -Math.abs(obj.vy) * restitution;
            obj.y = canvas.height - obj.radius;
        }

    }

    // Start checking for collisions
    for (let i = 0; i < gameObjects.length; i++)
    {
        obj1 = gameObjects[i];  
        for (let j = i + 1; j < gameObjects.length; j++)
        {
            obj2 = gameObjects[j];

            

            // Compare object1 with object2
            // if (rectIntersect(obj1.x, obj1.y, obj1.width, obj1.height, obj2.x, obj2.y, obj2.width, obj2.height)){
            //     obj1.isColliding = true;
            //     obj2.isColliding = true;
            // }

            if(circleIntersect(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.radius)){
                obj1.isColliding = true;
                obj2.isColliding = true;
                
                var vCollision = {x: obj2.x - obj1.x, y: obj2.y - obj1.y};
                var distance = Math.sqrt((obj2.x-obj1.x)*(obj2.x-obj1.x) + (obj2.y-obj1.y)*(obj2.y-obj1.y));
                var vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
                var vRelativeVelocity = {x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy};
                var speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
                speed *= Math.min(obj1.restitution, obj2.restitution);
                if (speed < 0) {
                    break;
                }

                var impulse = 2 * speed / (obj1.mass + obj2.mass);
                obj1.vx -= (impulse * obj2.mass * vCollisionNorm.x);
                obj1.vy -= (impulse * obj2.mass * vCollisionNorm.y);
                obj2.vx += (impulse * obj1.mass * vCollisionNorm.x);
                obj2.vy += (impulse * obj1.mass * vCollisionNorm.y);
            }

        }
    }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2){
        return false;
    }
    return true;
}

function circleIntersect(x1, y1, r1, x2, y2, r2) {

    // Calculate the distance between the two circles
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);

    // When the distance is smaller or equal to the sum
    // of the two radius, the circles touch or overlap
    return squareDistance <= ((r1 + r2) * (r1 + r2))
}

