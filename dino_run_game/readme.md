# Dino Run Canvas Game

Beginner-friendly endless runner made with HTML5 Canvas 2D.

Open `index.html` in a browser, click Start, then press Space, click, or tap the canvas to jump over obstacles.

## File structure

- `index.html` creates the canvas and loads scripts.
- `style.css` styles the page, canvas, score bar, and buttons.
- `game_object.js` has shared position, movement, and rectangle collision code.
- `dino.js` controls the player character and jump physics.
- `obstacle.js` controls cactus movement, drawing, and scoring.
- `game_ui.js` creates the HTML score bar and start/restart panel.
- `game.js` connects input, update, drawing, collision, start, and restart.
