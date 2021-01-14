const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

const configs = {
  W_ARENA: 8, // arena width
  H_ARENA: 20, // arena height
};

const variables = {
  T_INTERVAL: 1000, // timer interval
  D_INTERVAL: 1000, // initial drop interval

  TETROMINOS: "OTSZLJI", // tetromino keys
};

const tetrominos = [
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
];

class Game {
  constructor (name) {
    this.name = name; // player name
    this.score = 0;
    this.lines = 0;

    this.timer = null;
    this.timerCounter = 0;
    this.dropper = null;
    this.dropperInterval = variables.D_INTERVAL;

    this.tetromino = null; // current player tetromino
    this.x = 0; // position x of piece
    this.y = 0; // position y of piece

    this.arena = this.createMatrix(configs.W_ARENA, configs.H_ARENA);

    this.preload();
  }

  // =======@UNIVERSAL@=======
  createMatrix (width, height) { // DESC: creates height number of array with width number of array
    const matrix = [];
    while (height--) matrix.push(new Array(width).fill(0));

    return matrix;
  }

  merge (arena, matrix) { // DESC: merges matrix array into arena array
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) arena[y + this.y][x + this.x] = value;
      });
    });
  }

  collide (arena, matrix) { // DESC: check for matrix array existance in arena array
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (
          (
            matrix[y][x] &&
            arena[this.y + y] &&
            arena[this.y + y][this.x + x]
          ) !== 0
        ) return true;
      }
    }

    return false;
  }

  rotate (matrix) { // DESC: rotate matrix array
    const previousTetromino = matrix;
    const rotatedTetromino = [];

    for (let y = 0; y < matrix.length; y++) {
      const rotatedRow = [];
      for (let x = 0; x < matrix[y].length; x++) rotatedRow.push(matrix[y][x]); // TODO: push rotated row
      rotatedTetromino.push(rotatedRow);
    }

    if (this.collide(this.arena, rotatedTetromino)) return previousTetromino;

    return rotatedTetromino;
  }

  // =======@GAMEPLAY@=======
  drop () {
    this.y++;
    if (this.collide(this.arena, this.tetromino)) {
      this.y--;
      this.merge(this.arena, this.tetromino);
      this.round();
    }
  }

  move (direction) {
    this.x += direction;
    if (this.collide(this.arena, this.tetromino)) this.x -= direction;
  }

  playerRotate () {
    const previousX = this.x; // previous x tetromino position
    const previousT = this.tetromino; // previous tetromino rotation

    let offset = 1;
    this.tetromino = this.rotate(this.tetromino);

    while (this.collide(this.arena, this.tetromino)) {
      this.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));

      if (offset > this.tetromino.length) {
        this.x = previousX;
        this.tetromino = previousT;
        break;
      }
    }
  }

  // =======@GAME CONTROLLERS@=======
  setupKeyboard () {
    window.addEventListener("keydown", ({ keyCode }) => {
      switch (keyCode) {
        case 13: // ENTER
          this.start();
          break;
        case 27: // ESC
          this.stop();
          break;
        case 37: // ARROW LEFT
          this.move(-1);
          break;
        case 39: // ARROW RIGHT
          this.move(1);
          break;
        case 38: // ARROW UP
          this.playerRotate();
          break;
        case 40: // ARROW DOWN
          this.stopDropper();
          this.drop();
          this.startDropper();
          break;
        default:
          break;
      }
    });
  }

  getTetromino (tetrominoKey) {
    switch (tetrominoKey) {
      case "O":
        return tetrominos[0];
      case "T":
        return tetrominos[1];
      case "S":
        return tetrominos[2];
      case "Z":
        return tetrominos[3];
      case "L":
        return tetrominos[4];
      case "J":
        return tetrominos[5];
      case "I":
        return tetrominos[6];
      default:
        break;
    }
  }

  solidLines () {} // TODO: check for solid lines

  removeLines () {} // TODO: if solidLines count score and remove solidLines

  round () {
    const tetrominoKeys = variables.TETROMINOS;
    const randomKeyIndex = Math.random() * tetrominoKeys.length | 0;

    this.x = 0; // TODO: figure out the center of arena according to the piece
    this.y = 0;
    this.tetromino = this.getTetromino(tetrominoKeys[randomKeyIndex]);

    if (this.collide(this.arena, this.tetromino)) this.gameOver();
  }

  startTimer () {
    this.timer = setInterval(() => this.timerCounter++, variables.T_INTERVAL);
  }

  stopTimer () {
    clearInterval(this.timer);
  }

  startDropper () {
    this.dropper = setInterval(() => this.render(), this.dropperInterval);
  }

  stopDropper () {
    clearInterval(this.dropper);
  }

  start () {
    this.startTimer();
    this.startDropper();
  }

  stop () {
    this.stopTimer();
    this.stopDropper();
  }

  gameOver () {
    console.log("Game over!");
    this.stop();
  }

  // fired by dropper interval function
  render () {
    console.log("RENDER", this);
    this.drop();
  }

  draw () {
    context.clearRect(0, 0, 240, 400);

    // draw arena on canvas ...

    requestAnimationFrame(this.draw);
  }

  preload () {
    this.setupKeyboard();
    this.round();
  }
}

function main () {
  const game = new Game("player1");
  game.start();
  console.log("GAME IS LOADED", game);
}

window.addEventListener("load", main);
