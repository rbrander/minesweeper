console.log('Minesweeper!');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

/****************************************************************************/
// Cell

const CELL_SIZE = 20; // in pixels
const CELL_TYPE_EMPTY = '';
const CELL_TYPE_NUMBER = '9';
const CELL_TYPE_BOMB = '💣';
const CELL_TYPE_FLAG = '⚑';

function Cell(x, y) {
  this.x = x;
  this.y = y;
  this.isVisible = false;
  this.isFlagged = false;
  this.type = Math.random() <= 0.1 ? CELL_TYPE_BOMB : CELL_TYPE_EMPTY;
}

Cell.prototype.isBomb = function() { return this.type === CELL_TYPE_BOMB };
Cell.prototype.isEmpty = function() { return this.type === CELL_TYPE_EMPTY && this.isVisible === false };

const getNumBombsNearby = (x, y) => {
  let numBombsNearby = 0;
  // upper left
  if (x > 0 && y > 0 && grid[x - 1][y - 1].isBomb())
    numBombsNearby++;
  // upper center
  if (y > 0 && grid[x][y - 1].isBomb())
    numBombsNearby++;
  // upper right
  if (x < numCols - 1 && y > 0 && grid[x + 1][y - 1].isBomb())
    numBombsNearby++;
  // left center
  if (x > 0 && grid[x - 1][y].isBomb())
    numBombsNearby++;
  // right center
  if (x < numCols - 1 && grid[x + 1][y].isBomb())
    numBombsNearby++;
  // lower left
  if (x > 0 && y < numRows - 1 && grid[x - 1][y + 1].isBomb())
    numBombsNearby++;
  // lower center
  if (y < numRows - 1 && grid[x][y + 1].isBomb())
    numBombsNearby++;
  // lower right
  if (x < numCols - 1 && y < numRows - 1 && grid[x + 1][y + 1].isBomb())
    numBombsNearby++;
  return numBombsNearby;
}

/****************************************************************************/

const MOUSE_BUTTON_LEFT = 'left';
const MOUSE_BUTTON_CENTER = 'center';
const MOUSE_BUTTON_RIGHT = 'right';
const MOUSE_BUTTONS = [MOUSE_BUTTON_LEFT, MOUSE_BUTTON_CENTER, MOUSE_BUTTON_RIGHT];
let wasMouseClicked = false;
let buttonClicked = '';
let mouseClickPos = { x: 0, y : 0 };

let numCols, numRows, grid, gameRunning;

const isInBounds = (x, y) => x >= 0 && y >= 0 && x < numCols && y < numRows;

const update = (time) => {
  if (wasMouseClicked) {
    wasMouseClicked = false;
    const cellX = Math.floor(mouseClickPos.x / CELL_SIZE);
    const cellY = Math.floor(mouseClickPos.y / CELL_SIZE);
    if (buttonClicked === MOUSE_BUTTON_LEFT) {
      if (isInBounds(cellX, cellY) && grid[cellX][cellY].isVisible === false && grid[cellX][cellY].isFlagged === false) {
        grid[cellX][cellY].isVisible = true;
        if (grid[cellX][cellY].isBomb()) {
          // show all the bombs
          for (let y = 0; y < numRows; y++) {
            for (let x = 0; x < numCols; x++) {
              if (grid[x][y].isBomb() && !grid[x][y].isVisible) {
                grid[x][y].isVisible = true;
              }
            }
          }
          gameRunning = false;
        }
      }
    } else if (buttonClicked === MOUSE_BUTTON_RIGHT) {
      if (isInBounds(cellX, cellY) && grid[cellX][cellY].isVisible === false) {
        // Toggle the flag
        grid[cellX][cellY].isFlagged = !grid[cellX][cellY].isFlagged;
      }
    }
  }
  // Check to see if any blank visible tiles need expanding
  for (let cellY = 0; cellY < numRows; cellY++) {
    for (let cellX = 0; cellX < numCols; cellX++) {
      if (grid[cellX][cellY].isVisible && grid[cellX][cellY].type === CELL_TYPE_EMPTY) {
        // check all the neighbours to see if they need expanding
        const neighbours = [
          { x: cellX - 1, y: cellY - 1 }, // upper-left
          { x: cellX, y: cellY - 1 },     // upper-center
          { x: cellX + 1, y: cellY - 1 }, // upper-right
          { x: cellX - 1, y: cellY },     // center-left
          { x: cellX + 1, y: cellY },     // center-right
          { x: cellX - 1, y: cellY + 1 }, // bottom-left
          { x: cellX, y: cellY + 1 },     // bottom-center
          { x: cellX + 1, y: cellY + 1 }  // bottom-right
        ];
        neighbours.forEach(({x, y}) => {
          if (isInBounds(x, y) && !grid[x][y].isVisible && [CELL_TYPE_EMPTY, CELL_TYPE_NUMBER].includes(grid[x][y].type))
            grid[x][y].isVisible = true;
        });
      }
    }
  }
};

const drawCells = () => {
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.lineWidth = 2;
  ctx.font = `${CELL_SIZE * 0.6}px Arial`;
  grid.forEach(col => col.forEach(cell => {
    ctx.fillStyle = '#ccc';
    ctx.strokeStyle = cell.isVisible ? '#888' : 'white';
    ctx.fillRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.strokeRect(cell.x * CELL_SIZE, cell.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    ctx.beginPath()
    ctx.strokeStyle = cell.isVisible ? 'white' : '#888';
    ctx.moveTo(cell.x * CELL_SIZE + CELL_SIZE - 1, cell.y * CELL_SIZE + 1);
    ctx.lineTo(cell.x * CELL_SIZE + CELL_SIZE - 1, cell.y * CELL_SIZE + CELL_SIZE - 1);
    ctx.lineTo(cell.x * CELL_SIZE + 1, cell.y * CELL_SIZE + CELL_SIZE - 1);
    ctx.stroke();
    if (cell.isVisible) {
      if (cell.type === CELL_TYPE_BOMB) {
        ctx.fillText(CELL_TYPE_BOMB, cell.x * CELL_SIZE + ~~(CELL_SIZE / 2), cell.y * CELL_SIZE + ~~(CELL_SIZE / 2));
      } else if (cell.type === CELL_TYPE_NUMBER) {
        ctx.fillStyle = cell.colour;
        ctx.fillText(cell.numBombsAround.toString(), cell.x * CELL_SIZE + ~~(CELL_SIZE / 2), cell.y * CELL_SIZE + ~~(CELL_SIZE / 2));
      }
    } else if (cell.isFlagged) {
      // draw a flag on the cell
      ctx.fillStyle = 'black';
      ctx.font = `${CELL_SIZE * 0.8}px Arial`;
      ctx.fillText(CELL_TYPE_FLAG, cell.x * CELL_SIZE + (CELL_SIZE / 2), cell.y * CELL_SIZE + ~~(CELL_SIZE / 2));
    }
  }));
}

const draw = (time) => {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCells();
};

const loop = (time) => {
  update(time);
  draw(time);
  requestAnimationFrame(loop);
};

/************************************************************************/
// Event handlers

const onMouseDown = e => {
  // initialize the mouse position and state
  mouseClickPos = {
    x: e.offsetX,
    y: e.offsetY
  };
  buttonClicked = MOUSE_BUTTONS[e.button];
  wasMouseClicked = false;
};

const onMouseUp = e =>  {
  // Check to ensure we're not double clicking by checking the current state of the mouse click
  if (wasMouseClicked === false) {
    mouseClickPos = {
      x: e.offsetX,
      y: e.offsetY
    };
    buttonClicked = MOUSE_BUTTONS[e.button];
    wasMouseClicked = true;
  }
};

/************************************************************************/

const generateGrid = () => {
  numCols = ~~(canvas.width / CELL_SIZE);
  numRows = ~~(canvas.height / CELL_SIZE);
  grid = new Array(numCols).fill()
    .map((_, x) => new Array(numRows).fill()
      .map((_, y) => new Cell(x, y)));
  // Iterate over the grid to detect bombs and place numbers
  const numberColours = ['black', 'blue', 'green', 'red', 'purple', 'burgandy', 'teal', 'yellow'];
  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      if (grid[x][y].isEmpty()) {
        // count the number of bombs around, if greater than zero display that number
        // 1 = blue, 2 = green, 3 = red, 4 = purple, 5 = burgendy, 6 = teal, 7 = yellow
        const numBombsAround = getNumBombsNearby(x, y);
        if (numBombsAround > 0) {
          grid[x][y].numBombsAround = numBombsAround;
          grid[x][y].colour = numberColours[numBombsAround];
          grid[x][y].type = CELL_TYPE_NUMBER;
        }
      }
    }
  }
};

const init = () => {
  generateGrid();
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  gameRunning = true;
  requestAnimationFrame(loop);
};
init();
