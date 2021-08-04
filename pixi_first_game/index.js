const app = new PIXI.Application({ 
    width: 512,        
    height: 512,
    antialias: true,
});

const loader = app.loader;
const resources = loader.resources;
const TextureCache = PIXI.utils.TextureCache;

app.renderer.backgroundColor = 0x061639;

app.renderer.view.style.position = "absolute";
app.renderer.view.style.top = "50%";
app.renderer.view.style.left = "50%";
app.renderer.view.style.transform = "translate(-50%,-50%)";
app.renderer.view.style.border = "1px solid #d8d8d8";

document.body.appendChild(app.view);

loader.add("images/treasureHunter.json").load(setup);
let dungeon, explorer, treasure, door, explorerHit = false, blobs = [], gameScene, gameOverScene, message;
function setup() {

    gameScene = new PIXI.Container();
    app.stage.addChild(gameScene);

    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene)
    gameOverScene.visible = false;

    dungeon = new PIXI.Sprite(TextureCache["dungeon.png"]);
    gameScene.addChild(dungeon);

    explorer = new PIXI.Sprite(TextureCache["explorer.png"]);
    explorer.x = 68;
    explorer.y = app.stage.height / 2 - explorer.height / 2;
    gameScene.addChild(explorer);

    treasure = new PIXI.Sprite(TextureCache["treasure.png"]);
    treasure.x = app.stage.width - treasure.width - 48;
    treasure.y = app.stage.height / 2 - treasure.height / 2;
    gameScene.addChild(treasure);

    door = new PIXI.Sprite(TextureCache["door.png"]);
    door.x = door.width;
    gameScene.addChild(door);

    let numberOfBlobs = 7,
    spacing = 48,
    xOffset = 100,
    speed = 2,
    direction = 1;;
    
    for (let i = 0; i < numberOfBlobs; i++) {
        let blob = new PIXI.Sprite(TextureCache["blob.png"]);
        let x = spacing * i + xOffset;
        let y = randomInt(door.height, app.stage.height - door.height - blob.height);

        blob.x = x;
        blob.y = y;
        blob.vy = speed * direction;
        direction *= -1;
        blobs.push(blob);

        gameScene.addChild(blob);
    }

    healthBar = new PIXI.Container();
    healthBar.position.set(app.stage.width - 170, 4)
    gameScene.addChild(healthBar);

    let innerBar = new PIXI.Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    let outerBar = new PIXI.Graphics();
    outerBar.beginFill(0xFF3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;

    let style = new PIXI.TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white"
    });
    message = new PIXI.Text("The End!", style);
    message.x = 120;
    message.y = app.stage.height / 2 - 32;
    gameOverScene.addChild(message);

    controller();
    app.ticker.add(delta => gameLoop(delta));
}

function gameLoop(delta) {
    let hitBlob = false;
    blobs.forEach(function(blob) {
        blob.y += blob.vy * delta;

        let blobHitsWall = contain(blob);
        if (blobHitsWall === "top" || blobHitsWall === "bottom") {
            blob.vy *= -1;
        }

        if(hitTestRectangle(explorer, blob)) {
            hitBlob = true;
        }
    });

    if(hitBlob && !explorerHit) {
        explorerHit = true;
        healthBar.outer.width -= 30;

        let interval = setInterval(() =>{
            if(explorer.alpha == 1)
                explorer.alpha = 0.5
            else explorer.alpha = 1;
        }, 200)

        setTimeout(() =>{
            clearInterval(interval);
            explorer.alpha = 1;
            explorerHit = false;
        }, 1200)
    }

    if (hitTestRectangle(explorer, treasure)) {
        treasure.x = explorer.x + 8;
        treasure.y = explorer.y + 8;
    }

    if (hitTestRectangle(treasure, door)) {
        end();
        message.text = "You won!";
        app.ticker.stop()
    }

    if (healthBar.outer.width < 0) {
        end();
        message.text = "You lost!";
        app.ticker.stop()
    }

}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
    console.log(app.ticker)
}

function controller() {
    let left = keyboard("ArrowLeft"),
    up = keyboard("ArrowUp"),
    right = keyboard("ArrowRight"),
    down = keyboard("ArrowDown");

    left.press = () => {
        if(explorer.x > 28)
            explorer.x -= 5;
    }

    up.press = () => {
        if(explorer.y > 10)
            explorer.y -= 5;
    }

    right.press = () => {
        if(explorer.x < app.stage.width - 28 )
            explorer.x += 5;
    }

    down.press = () => {
        if(explorer.y < app.stage.height - 10 )
            explorer.y += 5;
    }
}

function contain(sprite, container = {x: 28, y: 10, width: 488, height: 480}) {

    let collision = undefined;
    //Left
    if (sprite.x < container.x) {
        sprite.x = container.x;
        collision = "left";
    }
    //Top
    if (sprite.y < container.y) {
        sprite.y = container.y;
        collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
        sprite.x = container.width - sprite.width;
        collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
        sprite.y = container.height - sprite.height;
        collision = "bottom";
    }

    return collision;
}


function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function keyboard(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) {
                key.press();
            }
                // key.isDown = true;
                // key.isUp = false;
                // event.preventDefault();
            }
    };

    key.upHandler = event => {
      if (event.key === key.value) {
        if (key.isDown && key.release) key.release();
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener(
      "keydown", downListener, false
    );
    window.addEventListener(
      "keyup", upListener, false
    );
    
    // Detach event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
}

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    hit = false;

    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

      //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {

        //There's definitely a collision happening
            hit = true;
        } else {

        //There's no collision on the y axis
            hit = false;
        }
    } else {
      //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
};




