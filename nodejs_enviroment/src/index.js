import {xy, Polygon, Circle} from './model.js';
import * as PIXI from 'pixi.js'
import {calcDistance} from './lib.js'
import {WIDTH, HEIGHT} from './constant.js'


let fps = 0;
let framesThisSecond = 0;
let lastFpsUpdate = 0;
let maxFPS = 75;
let timeStep = 1/maxFPS;
let speed = 10;

let app = new PIXI.Application({ 
    width: WIDTH,
    height: HEIGHT,
    antialias: true,
    transparent: false,
});


app.renderer.backgroundColor = 0xffffff;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.left = "50%";
app.renderer.view.style.top = "50%";
app.renderer.view.style.transform = "translate(-50%,-50%)";
app.renderer.view.style.border = "1px solid black";
let fpsText = new PIXI.Text('FPS: '+fps);

let delta = 0;
let oldTimeStamp = 0;

window.onload = main;

let listObject = [];

function main() {
    'use district';
    document.body.appendChild(app.view);
    

    listObject.push(new Polygon([
        new xy(110,100),
        new xy(130,50),
        new xy(110,30),
        new xy(40,30),
        new xy(40,100)
    ], new xy(10, 20)));

    listObject.push( new Polygon([
        new xy(200,100),
        new xy(150,100),
        new xy(150,150),
        new xy(200, 150)
    ], new xy(20, 10)));

    listObject.push( new Polygon([
        new xy(350, 300),
        new xy(350, 400),
        new xy(280, 350)
    ], new xy(-15, -15)));

    listObject.push(new Circle(new xy(30, 30), 20, new xy(0, 20)));
    listObject.push(new Circle(new xy(100, 80), 20, new xy(15, 20)));
    listObject.push(new Circle(new xy(150, 40), 20, new xy(24, 10)));
    listObject.push(new Circle(new xy(200, 50), 20, new xy(10, 20)));

    listObject.forEach(object =>{
        app.stage.addChild(object.graphics);
    })

    fpsText.x = 10;
    fpsText.y = 10;
    
    app.stage.addChild(fpsText);

    gameLoop()
}

function gameLoop(timeStamp){
    
    if(timeStamp){

        if (timeStamp < oldTimeStamp + (1000 / maxFPS)) {
            requestAnimationFrame(gameLoop);
            return;
        }

        delta += (timeStamp - oldTimeStamp) / 1000;
        oldTimeStamp = timeStamp;

        while (delta >= timeStep) {
            update(timeStep);
            delta -= timeStep;
        }


        if (timeStamp > lastFpsUpdate + 1000) {
            fps = 0.25 * framesThisSecond + (1 - 0.25) * fps;
            lastFpsUpdate = timeStamp;
            framesThisSecond = 0;
        }
        framesThisSecond++;

        fpsText.text = "FPS: " +  Math.round(fps);
        
    }
    
    window.requestAnimationFrame(gameLoop)
}

function update(timeStep){
    for(let object of listObject){
        object.graphics.clear();
        object.isColliding = false;
        object.update(timeStep);

        if(object.checkCollision()){
            object.isColliding = true;
        }
        for(let checkObject of listObject){
            if(checkObject !== object){
                if(object.checkCollision(checkObject)){
                    object.isColliding = true;

                    let obj1;
                    let obj2;
                    if(object instanceof Polygon)
                        obj1 = object.vertices[0];
                    else
                        obj1 = object.center;

                    if(checkObject instanceof Polygon)
                        obj2 = checkObject.vertices[0];
                    else
                        obj2 = checkObject.center;
                    
                    let vCollision = new xy(obj2.x - obj1.x, obj2.y - obj1.y);
                    let distance = calcDistance(vCollision);
                    let vCollisionNorm = new xy(vCollision.x/distance, vCollision.y/distance);
                    let vRelativeVelocity = new xy(object.vxy.x - checkObject.vxy.x, object.vxy.y - checkObject.vxy.y);
                    let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
                    
                    if(speed < 0){
                        continue;
                    }

                    object.vxy.x -= speed * vCollisionNorm.x;
                    object.vxy.y -= speed * vCollisionNorm.y;
                    checkObject.vxy.x += speed * vCollisionNorm.x;
                    checkObject.vxy.y += speed * vCollisionNorm.y;

                }
            }
            
        }
        object.draw();
    }
}


document.getElementById("btn-fps_up").addEventListener("click", () => {
    maxFPS < 140 ? maxFPS += 10 : console.warn('Max FPS: 140')
})

document.getElementById("btn-fps_down").addEventListener("click", () => {
    maxFPS > 10 ? maxFPS -= 10 : console.warn('Min FPS: 10')
})
document.getElementById("btn-speed_up").addEventListener("click", () => {
    if(speed < 70){
        speed += 10
        listObject.forEach(object => {
            object.setSpeed(speed)
        })
    }
    else console.warn('Max speed: 70')

})
document.getElementById("btn-speed_down").addEventListener("click", () =>{
    if(speed > 0){
        speed -= 5
        listObject.forEach(object => {
            object.setSpeed(speed)
        })
    }
    else console.warn('Min speed: 0')
})