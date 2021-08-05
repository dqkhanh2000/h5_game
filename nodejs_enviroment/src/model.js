import * as PIXI from 'pixi.js'
import {WIDTH, HEIGHT} from './constant.js'

import {calcDistance, dotProduct, rotate} from './lib.js'

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

export {
    xy,
    Polygon,
    Circle,
}