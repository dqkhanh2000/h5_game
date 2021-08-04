const WIDTH = 500;
const HEIGHT = 500;
let fps = 0;
let framesThisSecond = 0;
let lastFpsUpdate = 0;
let maxFPS = 75;
let timeStep = 1/maxFPS;
let speed = 10;

let app = new PIXI.Application({ 
    width: WIDTH,         // default: 800
    height: HEIGHT,        // default: 600
    antialias: true,    // default: false
    transparent: false, // default: false
    resolution: 1       // default: 1
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

class xy{
    constructor (x, y){
        this.x = x;
        this.y= y;
    }
}

class GameObject{
    constructor(vxy = new xy(0,0), graphics = new PIXI.Graphics(), speed = 10){
        this.graphics=graphics;
        this.vxy=vxy;
        this.speed = speed;
        this.isColliding = false;
        this.direction = 0;
    }

    setSpeed(speed){
        this.speed = speed;
    }

    draw(){};
    update(){};
    checkCollision(){};

}

class Polygon extends GameObject{
    constructor(vertices=[], vxy = new xy(0,0), color=0x0099b0){
        super(vxy);
        this.vertices = vertices;
        this.edges = [];
        this.color = color;
        this.setEdge();
    }
    setEdge(){
        let prePoint = null;
        this.vertices.forEach((point, index) =>{
            if(index !== 0)
                this.edges.push(new xy(point.x-prePoint.x, point.y-prePoint.y));
            prePoint = point;
        })
        this.edges.push(new xy(prePoint.x - this.vertices[0].x, prePoint.y - this.vertices[0].y));
    }

    draw(){
        
        this.color = this.isColliding ? 0xff8080 : 0x0099b0;
        this.graphics.lineStyle(0);
        this.graphics.beginFill(this.color, 1);
        this.graphics.moveTo(this.vertices[0].x, this.vertices[0].y);
        this.vertices.forEach((xy, index) => {
            if(index !== 0)
                this.graphics.lineTo(xy.x, xy.y);
            
        });
        this.graphics.endFill();
        
    }

    update(delta){
        
        this.vertices.forEach((vertex, index) => {
            vertex.x += this.vxy.x*delta * this.speed;
            vertex.y += this.vxy.y*delta * this.speed;
            if(index !== 0){
                vertex = rotate(vertex, this.vertices[0], this.direction);
            }
                
        })

    }

    

    checkCollision(object = null){

        if( object instanceof Circle){
            return this.checkCollisionWithCircle(object);          
        }
        else if( object instanceof Polygon){
            return this.sat(object);
        }
        else{
            let result = false;
            for(let vertex of this.vertices){
                if(vertex.x <= 0 && this.vxy.x < 0){
                    this.vxy.x = - this.vxy.x;
                    result = true;
                }
                else if ( vertex.x >= WIDTH && this.vxy.x > 0){
                    this.vxy.x = - this.vxy.x;
                    result = true;
                }
                    
                if(vertex.y <= 0 && this.vxy.y < 0){
                    this.vxy.y = - this.vxy.y;
                    result = true;
                }
                else if ( vertex.y >= HEIGHT && this.vxy.y > 0){
                    this.vxy.y = - this.vxy.y;
                    result = true;
                }
            }
            return result;
            

        }
        
    }

    checkCollisionWithCircle(object){

        let result = false;
        let vector = new xy(0, 0);
        let vLength = 0;
        let projectVector = new xy(0, 0);
        let projectPoint = new xy(0, 0);
        let edgeVector;
        let dotTmp;
        let eLength = 0;
        
        this.vertices.forEach( (vertex, index) => {
            vector.x = object.center.x - vertex.x;
            vector.y = object.center.y - vertex.y;

            vLength = calcDistance(vector);
            eLength = calcDistance(this.edges[index]);

            if( vLength < object.radius){
                result = true;
            }

            edgeVector = this.edges[index]
            dotTmp = dotProduct(vector, edgeVector) / dotProduct(edgeVector, edgeVector);                
            projectVector.x = edgeVector.x*dotTmp;
            projectVector.y = edgeVector.y*dotTmp;

            projectPoint.x = projectVector.x + vertex.x;
            projectPoint.y = projectVector.y + vertex.y;

            if(calcDistance(projectPoint, object.center) < object.radius){
                if(index < this.vertices.length - 1){
                    if(calcDistance(projectPoint, vertex) < eLength
                        && calcDistance(projectPoint, this.vertices[index+1]) < eLength)
                        result = true;
                }
                else{
                    if(calcDistance(projectPoint, vertex) < eLength
                        && calcDistance(projectPoint, this.vertices[0]) < eLength)
                        result = true;
                }
                    
            }
            
            
        });

        return result;
    }

    sat(object) {
        let perpendicularLine = null;
        let dot = 0;
        let perpendicularStack = [];
        let amin = null;
        let amax = null;
        let bmin = null;
        let bmax = null;
        
        this.edges.forEach(edge => {
            perpendicularLine = new xy(-edge.y, edge.x);
            perpendicularStack.push(perpendicularLine);
        })
        object.edges.forEach(edge => {
            perpendicularLine = new xy(-edge.y, edge.x);
            perpendicularStack.push(perpendicularLine);
        })

        for( let perpendicularLine of perpendicularStack) {
            amin = null;
            amax = null;
            bmin = null;
            bmax = null;

            this.vertices.forEach(vertex => {
                dot = dotProduct(perpendicularLine, vertex);
                if(amax === null || dot > amax){
                    amax = dot;
                }
                if(amin === null || dot < amin){
                    amin = dot;
                }
            });

            object.vertices.forEach(vertex => {
                dot = dotProduct(perpendicularLine, vertex);
                if(bmax === null || dot > bmax){
                    bmax = dot;
                }
                if(bmin === null || dot < bmin){
                        bmin = dot;
                }
            });
            

            if(!((amin < bmax && amin > bmin) ||
                (bmin < amax && bmin > amin))){
                return false;
            }
        }
        return true;
    }
}

class Circle extends GameObject {
    constructor(center, radius, vxy = new xy(0,0),color=0x0099b0){
        super(vxy);
        this.center = center;
        this.radius = radius;
        this.color = color;
        this.isColliding = false;
    }

    draw(){
        this.color = this.isColliding ? 0xff8080 : 0x0099b0;
        this.graphics.lineStyle(0);
        this.graphics.beginFill(this.color, 1);
        this.graphics.drawCircle(this.center.x, this.center.y, this.radius);
        this.graphics.endFill();
    }

    checkCollision(object = null){
        
        if(object instanceof Polygon){
            return object.checkCollision(this);
        }
        else if(object instanceof Circle){
            let distance = calcDistance(this.center, object.center);
            return distance < this.radius + object.radius;
        }
        else{
            let result = false;
            if(this.center.x - this.radius <= 0 && this.vxy.x < 0){
                this.vxy.x = -this.vxy.x;
                result = true; //
            }
            else if(this.center.x + this.radius >= WIDTH && this.vxy.x > 0 ){
                this.vxy.x = -this.vxy.x;
                result = true; //
            }
            if(this.center.y - this.radius <= 0 && this.vxy.y < 0){
                this.vxy.y = -this.vxy.y;
                result = true; //
            }
            else if(this.center.y + this.radius >= HEIGHT && this.vxy.y > 0 ){
                this.vxy.y = -this.vxy.y;
                result = true; //
            }

            return result;

        }
    }

    update(delta){
        this.center.x += this.vxy.x * delta * this.speed;
        this.center.y += this.vxy.y * delta * this.speed;
    }
}


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

function dotProduct(vertex1, vertex2) {
    return  (vertex1.x * vertex2.x) + (vertex1.y * vertex2.y);
}

function calcDistance(vertex1, vertex2 = null) {
    if(vertex2 === null)
        return Math.sqrt(vertex1.x**2+vertex1.y**2);
    return Math.sqrt((vertex1.x-vertex2.x)**2 + (vertex1.y-vertex2.y)**2)
}

function rotate(point, anchor, theta){
    let s = Math.sin(theta);
    let c = Math.cos(theta)

    point.x -= anchor.x;
    point.y -= anchor.y;

    let xnew = point.x * c - point.y * s;
    let ynew = point.x * s + point.y * c;

    point.x = xnew + anchor.x;
    point.y = ynew + anchor.y;
    return point;

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