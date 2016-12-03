var NUM_ROWS = 20;
var NUM_COLS = 10;
var BLOCK_WIDTH = 30;
var BLOCK_HEIGHT = 30;
var TICK_MS = 400;
var CURSOR_LEFT = 37;
var CURSOR_RIGHT = 39;
var CURSOR_DOWN = 40;
var KEY_A = 65;
var KEY_D = 68;
var KEY_R = 82;
var KEY_ENTER = 13;
var KEY_SPACE = 32;

var blockPiece = [
  [0, 0, 0, 0],
  [0, 1, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
];

var longPiece = [
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
];

var tPiece = [
  [0, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 0],
];

var zlPiece = [
  [0, 0, 0, 0],
  [0, 0, 1, 1],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
];

var zrPiece = [
  [0, 0, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1],
  [0, 0, 0, 0],
];

var llPiece = [
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
];

var lrPiece = [
  [0, 1, 0, 0],
  [0, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 0, 0],
];

function rotateLeft(piece) {
  return [
    [piece[0][3], piece[1][3], piece[2][3], piece[3][3]],
    [piece[0][2], piece[1][2], piece[2][2], piece[3][2]],
    [piece[0][1], piece[1][1], piece[2][1], piece[3][1]],
    [piece[0][0], piece[1][0], piece[2][0], piece[3][0]],
  ];
}

function rotateRight(piece) {
  return [
    [piece[3][0], piece[2][0], piece[1][0], piece[0][0]],
    [piece[3][1], piece[2][1], piece[1][1], piece[0][1]],
    [piece[3][2], piece[2][2], piece[1][2], piece[0][2]],
    [piece[3][3], piece[2][3], piece[1][3], piece[0][3]],
  ];
}

function intersects(rows, piece, y, x) {
  for (var i = 0; i < 4; ++i) {
    for (var j = 0; j < 4; ++j) {
      if (piece[i][j]) {
        if (y + i >= NUM_ROWS || x + j < 0 || x + j >= NUM_COLS || rows[y + i][x + j]) {
          return true;
        }
      }
    }
  }

  return false;
}

function applyPiece(rows, piece, y, x) {
  var newRows = [];
  for (var i = 0; i < NUM_ROWS; ++i) {
    // slice() is used to copy an array.
    newRows[i] = rows[i].slice();
  }

  for (var i = 0; i < 4; ++i) {
    for (var j = 0; j < 4; ++j) {
      if (piece[i][j]) {
        newRows[y + i][x + j] = 1;
      }
    }
  }
  return newRows;
}

function kill_rows(rows) {
  var newRows = [];
  var k = NUM_ROWS;
  for (var i = NUM_ROWS; i --> 0;) {
    for (var j = 0; j < NUM_COLS; ++j) {
      if (!rows[i][j]) {
        // slice() is used to copy an array.
        newRows[--k] = rows[i].slice();
        break;
      }
    }
  }
  for (var i = 0; i < k; ++i) {
    newRows[i] = [];
    for (var j = 0; j < NUM_COLS; ++j) {
      newRows[i][j] = 0;
    }
  }

  return {
    'rows': newRows,
    'numRowsKilled': k,
  };
}

function randomPiece() {
  var pieces = [blockPiece, longPiece, tPiece, zlPiece, zrPiece, llPiece, lrPiece];
  var i = Math.floor(Math.random() * pieces.length);
  return pieces[i];
}

function TetrisGame() {
  this.paused = false;
  this.gameOver = false;
  this.score = 0;
  this.currentPiece = randomPiece();
  this.nextPiece = randomPiece();
  this.pieceY = 0;
  this.pieceX = 3;
  this.rows = [];
  for (var i = 0; i < NUM_ROWS; ++i) {
    this.rows[i] = []
    for (var j = 0; j < NUM_COLS; ++j) {
      this.rows[i][j] = 0;
    }
  }
}

TetrisGame.prototype.tick = function() {
  if (this.paused || this.gameOver) {
    return false;
  }

  if (intersects(this.rows, this.currentPiece, this.pieceY + 1, this.pieceX)) {
    // burn current piece into board
    this.rows = applyPiece(this.rows, this.currentPiece, this.pieceY, this.pieceX);
    var r = kill_rows(this.rows);
    this.rows = r.rows;
    this.score += 1 + r.numRowsKilled * r.numRowsKilled * NUM_COLS;

    //fetch next piece
    if (intersects(this.rows, this.nextPiece, 0, NUM_COLS / 2 - 2)) {
      this.gameOver = true;
    } else {
      this.currentPiece = this.nextPiece;
      this.pieceY = 0;
      this.pieceX = NUM_COLS / 2 - 2;
      this.nextPiece = randomPiece();
    }
  } else {
    this.pieceY += 1;
  }

  return true;
}

TetrisGame.prototype.togglePaused = function() {
  this.paused = !this.paused;
}

TetrisGame.prototype.steerLeft = function() {
  if (!intersects(this.rows, this.currentPiece, this.pieceY, this.pieceX - 1))
    this.pieceX -= 1;
}

TetrisGame.prototype.steerRight = function() {
  if (!intersects(this.rows, this.currentPiece, this.pieceY, this.pieceX + 1))
    this.pieceX += 1;
}

TetrisGame.prototype.steerDown = function() {
  if (!intersects(this.rows, this.currentPiece, this.pieceY + 1, this.pieceX))
    this.pieceY += 1;
}

TetrisGame.prototype.rotateLeft = function() {
  var newPiece = rotateLeft(this.currentPiece);
  if (!intersects(this.rows, newPiece, this.pieceY, this.pieceX))
    this.currentPiece = newPiece;
}

TetrisGame.prototype.rotateRight = function() {
  var newPiece = rotateRight(this.currentPiece);
  if (!intersects(this.rows, newPiece, this.pieceY, this.pieceX))
    this.currentPiece = newPiece;
}

TetrisGame.prototype.letFall = function() {
  while (!intersects(this.rows, this.currentPiece, this.pieceY+1, this.pieceX))
    this.pieceY += 1;
  this.tick();
}

TetrisGame.prototype.getRows = function() {
  return applyPiece(this.rows, this.currentPiece, this.pieceY, this.pieceX);
}

TetrisGame.prototype.getNextPiece = function() {
  return this.nextPiece;
}

TetrisGame.prototype.getScore = function() {
  return this.score;
}

TetrisGame.prototype.getGameOver = function() {
  return this.gameOver;
}

function draw_blocks(rows, num_rows, num_cols) {
  var boardElem = document.createElement('div');
  for (var i = 0; i < num_rows; ++i) {
    for (var j = 0; j < num_cols; ++j) {
      var blockElem = document.createElement('div');
      blockElem.classList.add('tetrisBlock');
      if (rows[i][j])
        blockElem.classList.add('habitated');
      blockElem.style.top = (i * BLOCK_HEIGHT) + 'px';
      blockElem.style.left = (j * BLOCK_WIDTH) + 'px';
      boardElem.appendChild(blockElem);
    }
  }
  return boardElem;
}

function drawTetrisGame(game) {
  var leftPaneElem = drawTetrisLeftPane(game);
  var rightPaneElem = drawTetrisRightPane(game);
  var gameElem = document.createElement('div');
  gameElem.classList.add('tetrisGame');
  gameElem.appendChild(leftPaneElem);
  gameElem.appendChild(rightPaneElem);
  return gameElem;
}

function drawTetrisLeftPane(game) {
  var scoreElem = drawTetrisScore(game);
  var previewElem = drawTetrisPreview(game);
  var usageElem = drawTetrisUsage(game);
  var leftPaneElem = document.createElement('div');
  leftPaneElem.classList.add('tetrisLeftPane');
  leftPaneElem.appendChild(previewElem);
  leftPaneElem.appendChild(scoreElem);
  leftPaneElem.appendChild(usageElem);
  return leftPaneElem;
}

function drawTetrisRightPane(game) {
  var boardElem = drawTetrisBoard(game);
  var rightPaneElem = document.createElement('div');
  rightPaneElem.classList.add('tetrisRightPane');
  rightPaneElem.appendChild(boardElem);
  return rightPaneElem;
}

function drawTetrisBoard(game) {
  var rows = game.getRows();
  var boardElem = draw_blocks(rows, NUM_ROWS, NUM_COLS);
  boardElem.classList.add('tetrisBoard');
  return boardElem;
}

function drawTetrisScore(game) {
  var score = game.getScore();
  var scoreElem = document.createElement('div');
  scoreElem.classList.add('tetrisScore');
  scoreElem.innerHTML = '<p>SCORE: ' + score + '</p>';
  if (game.getGameOver()) {
    scoreElem.innerHTML += '<p>GAME OVER</p>'
  }

  return scoreElem;
}

function drawTetrisPreview(game) {
  var piece = game.getNextPiece();
  var pieceElem = draw_blocks(piece, 4, 4);
  var previewElem = document.createElement('div');
  previewElem.classList.add('tetrisPreview');
  previewElem.appendChild(pieceElem);
  return previewElem;
}

function drawTetrisUsage(game) {
  var usageElem = document.createElement('div');
  usageElem.classList.add('tetrisUsage');
  usageElem.innerHTML =
    '<table>' +
    '<tr><th>Cursor Keys</th><td>Steer</td></tr>' +
    '<tr><th>a/d</th><td>Rotate</td></tr>' +
    '<tr><th>Space bar</th><td>Let fall</td></tr>' +
    '<tr><th>Enter</th><td>Toggle pause</td></tr>' +
    '<tr><th>r</th><td>Restart game</td></tr>' +
    '</table>';
  return usageElem;
}

function redraw(game, containerElem) {
  var gameElem = drawTetrisGame(game);
  containerElem.innerHTML = '';
  containerElem.appendChild(gameElem);
}

function tetrisRun(containerElem) {
  var game = null;
  var intervalHandler = null;
  var keyHandler = null;

  function setIntervalHandler() {
    intervalHandler = setInterval(
      function() {
        if (game.tick()) {
          redraw(game, containerElem);
        }
      },
      TICK_MS
    );
  }

  function clearIntervalHandler() {
    clearInterval(IntervalHandler);
    intervalHandler = null;
  }

  function setKeyHandler() {
    keyHandler = containerElem.addEventListener('keydown', function(key) {
      if (key.shiftKey || key.altKey || key.metaKey) {
        return;
      }

      var consumed = true;
      if (key.keyCode === CURSOR_LEFT) {
        game.steerLeft();
      } else if (key.keyCode === CURSOR_RIGHT) {
        game.steerRight();
      } else if (key.keyCode === CURSOR_DOWN) {
        game.steerDown();
      } else if (key.keyCode === KEY_A) {
        game.rotateLeft();
      } else if (key.keyCode === KEY_D) {
        game.rotateRight();
      } else if (key.keyCode === KEY_SPACE) {
        game.letFall();
      } else if (key.keyCode === KEY_ENTER) {
        game.togglePaused();
      } else if (key.keyCode === KEY_R) {
        game = new TetrisGame();
      } else {
        consumed = false;
      }

      if (consumed) {
        key.preventDefault();
        redraw(game, containerElem);
      }
    });
  }

  function clearKeyHandler() {
    containerElem.removeEventListener('keydown', keyHandler);
    keyHandler = null;
  }

  game = new TetrisGame();
  redraw(game, containerElem);
  setIntervalHandler();
  setKeyHandler();
}
