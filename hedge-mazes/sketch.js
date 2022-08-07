let cmdEmulator;

let xCoord = 0, yCoord = 0;
let xMaze = 0, yMaze = 0;
let entrance = 0, mazeExit = 0;
let moveCounter = 2;
let pointClear = 0, boostClear = 0;
let mazeScore = 1000, mazeLevel = 1;
let boost = 0;

// change these values to change maze size (11 x 38 fills screen)
const RTotal = 11, CTotal = 38;
const mazeWidth = (CTotal * 2) + 1;
const mazeHeight = (RTotal * 2) + 1;

// the maze
const MAZE = new Array(mazeHeight).fill().map(_ => new Array(mazeWidth).fill(toCode(' ')));

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  cmdEmulator = new CmdEmulator({ main, exeName: 'Hedge Mazes' });
}

function draw() {
  cmdEmulator.draw();
}

async function main() {
  cmd.setConsoleTitle('Hedge Maze - Vezi-Play');

  await showVeziPlayLogo();

  cmd.setColor(10);

  do // 1 loop = 1 maze
  {
    let exitMaze = 0;

    cmd.gotoxy(35, 11);
    cmd.cout('++++++++++');
    cmd.gotoxy(34, 12);
    cmd.cout('++LEVEL ' + `${mazeLevel}`.padStart(2) + '++');
    cmd.gotoxy(35, 13);
    cmd.cout('++++++++++');
    cmd.gotoxy(24, 22);
    await cmd.pause();
    cmd.clear();
    
    // reset point/boost counters
    pointClear = 0;
    boostClear = 0;
    
    generateMaze();
    generatePoints();

    cmd.setColor(11);
    // display the maze
    cmd.cout('     USE THE ARROW KEYS TO NAVIGATE THE MAZE. YOU ARE THE ' + toChar(2) + ', GET TO THE X!').endl();
    cmd.setColor(10);

    for (let r = 0; r < mazeHeight; r++) {
      cmd.cout(' ');
      for (let c = 0; c < mazeWidth; c++) {
        if (MAZE[r][c] !== 36 && MAZE[r][c] !== 15) {
          cmd.cout(MAZE[r][c]);
        } else if (MAZE[r][c] === 36) {
          cmd.setColor(12);
          cmd.cout(MAZE[r][c]);
          cmd.setColor(10);
        } else {
          cmd.setColor(14);
          cmd.cout(MAZE[r][c]);
          cmd.setColor(10);
        }
      }
      cmd.endl();
    }

    showScore();

    xMaze = 0;
    yMaze = entrance*2+1;
    cmd.gotoxy(xMaze+1, yMaze+1);

    // loop movements until player reaches exit (exitMaze = true)
    while (exitMaze === 0) {
      showScore();
      exitMaze = await move();

      if (exitMaze === 2) {
        cmd.clear();
        cmd.gotoxy(32, 11);
        cmd.cout('Final Score: ' + mazeScore);
        cmd.gotoxy(31, 13);
        cmd.cout('Thanks for playing!');
        cmd.gotoxy(24, 22);
        await cmd.pause();

        return 0;
      }
    }

    cmd.gotoxy(35, 11);
    cmd.cout('++++++++++');
    cmd.gotoxy(34, 12);
    cmd.cout('++YOU WIN!++');
    cmd.gotoxy(35, 13);
    cmd.cout('++++++++++');
    cmd.gotoxy(24, 22);
    await cmd.pause();
    cmd.clear();

    if (pointClear === 0) { // if every point was grabbed
      mazeScore += (1000 * mazeLevel);

      showScore();

      cmd.gotoxy(31, 10);
      cmd.cout('++++++++++++++++++');
      cmd.gotoxy(30, 11);
      cmd.cout('++ALL POINTS CLEAR!++');
      cmd.gotoxy(31, 12);
      cmd.cout('++++++++++++++++++');
      cmd.gotoxy(30, 13);
      cmd.cout('++  BONUS: +' + `${mazeLevel}`.padStart(2) + '000  ++');
      cmd.gotoxy(31, 14);
      cmd.cout('++++++++++++++++++');
      cmd.gotoxy(24, 22);
      await cmd.pause();
      cmd.clear();
    }

    if (boostClear === 0) { // if every boost was grabbed
      mazeScore += (100 * mazeLevel);

      showScore();

      cmd.gotoxy(31, 10);
      cmd.cout('++++++++++++++++++');
      cmd.gotoxy(30, 11);
      cmd.cout('++ALL BOOSTS CLEAR!++');
      cmd.gotoxy(31, 12);
      cmd.cout('++++++++++++++++++');
      cmd.gotoxy(30, 13);
      cmd.cout('++  BONUS:  +' + `${mazeLevel}`.padStart(2) + '00  ++');
      cmd.gotoxy(31, 14);
      cmd.cout('++++++++++++++++++');
      cmd.gotoxy(24, 22);
      await cmd.pause();
      cmd.clear();
    }

    mazeLevel++;

  } while (mazeLevel < 39); // until level 38 complete

  cmd.gotoxy(29, 10);
  cmd.cout('++++++++++++++++++++++');
  cmd.gotoxy(28, 11);
  cmd.cout('++  CONGRATULATIONS!!  ++');
  cmd.gotoxy(29, 12);
  cmd.cout('++++++++++++++++++++++');
  cmd.gotoxy(28, 13);
  cmd.cout('++FINAL SCORE: ' + `${mazeScore}`.padEnd(8) + '++');
  cmd.gotoxy(29, 14);
  cmd.cout('++++++++++++++++++++++');
  cmd.gotoxy(24, 22);
  await cmd.pause();

  return 0;
}

function showScore() {
  cmd.gotoxy(72, 24);
  cmd.cout('       ');
  cmd.gotoxy(65, 24);
  cmd.cout('Score: ' + mazeScore);
}

function showBoost() {
  cmd.gotoxy(52, 24);
  cmd.cout('    ');
  cmd.gotoxy(45, 24);
  cmd.cout('BOOST: ' + boost);
}

// makes a move through the maze by reading an arrow key
async function move() {
  let arrow = 0;
  let xMazeNew = xMaze, yMazeNew = yMaze;
  let xBoost = xMaze, yBoost = yMaze; // the space being skipped over by a boost move
  
  arrow = await cmd.getch();

  if (arrow === ESCAPE) {
    return 2;
  }

  switch (arrow) {
    case UP_ARROW:
      yMazeNew--;
      if (boost > 0) {
        yMazeNew--;
        yBoost--;
      }
      break;
    case DOWN_ARROW:
      yMazeNew++;
      if (boost > 0) {
        yMazeNew++;
        yBoost++;
      }
      break;
    case LEFT_ARROW:
      xMazeNew--;
      if (boost > 0) {
        xMazeNew--;
        xBoost--;
      }
      break;
    case RIGHT_ARROW:
      xMazeNew++;
      if (boost > 0) {
        xMazeNew++;
        xBoost++;
      }
      break;
    default:
      return 0; // a different key was pressed
  }

  /*
    JS PORT NOTE: The original project did not handle index out of bounds issues (ex. boosting through
    outer-most walls), but this does not cause errors in C++ and execution would continue normally.
    Here however, we must explicitly handle index range checking to ensure valid moves.
  */
  if (xMazeNew < 0 || xMazeNew >= mazeWidth || yMazeNew < 0 || yMazeNew >= mazeHeight) {
    if (MAZE[yBoost][xBoost] !== toCode('X')) {
      return 0;
    }
  }

  // xMazeNew < 0 means player tried to move out of maze on first move
  // MAZE[r][c] = 177 means player tried to move into a wall
  // if it's a boost move, MAZE[yBoost][xBoost] = the space being boosted over
  if (xMazeNew < 0 || MAZE[yMazeNew][xMazeNew] === 177 || MAZE[yBoost][xBoost] === 177) {
    return 0;
  }

  let newColor = moveCounter % 6;

  switch (newColor) {
    case 0:
      cmd.setColor(12);
      break;
    case 1:
      cmd.setColor(14);
      break;
    case 2:
      cmd.setColor(10);
      break;
    case 3:
      cmd.setColor(11);
      break;
    case 4:
      cmd.setColor(3);
      break;
    case 5:
      cmd.setColor(13);
      break;
  }

  // if the attempted move leads to an open space, make the move
  if (MAZE[yMazeNew][xMazeNew] === toCode(' ')) {
    if (xBoost === xMaze && yBoost === yMaze) { // NOT a boost move
      // leave trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(43);

      // mark location in maze as visited
      MAZE[yMaze][xMaze] = 43;

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter++; // moving forward
      mazeScore--; // -1 point per move
    } else { // a boost move to open space (already know it's not a move into a wall)
      // leave trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(43);
      cmd.gotoxy(xBoost+1, yBoost+1);
      cmd.cout(43);

      // mark location in maze as visited
      MAZE[yMaze][xMaze] = 43;
      MAZE[yBoost][xBoost] = 43;

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter += 2; // moving forward
    }
  } else if (MAZE[yMazeNew][xMazeNew] === 43) { // if square is visited
    if (xBoost === xMaze && yBoost === yMaze) { // NOT a boost move
      // overwrite trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(' ');

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;
      
      // mark location in maze as un-visited
      MAZE[yMaze][xMaze] = toCode(' ');

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter--; // back-tracking
      mazeScore--; // -1 point per move
    } else { // a boost move to visited space
      // overwrite trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(' ');
      cmd.gotoxy(xBoost+1, yBoost+1);
      cmd.cout(' ');

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;

      // mark location in maze as un-visited
      MAZE[yMaze][xMaze] = toCode(' ');
      MAZE[yBoost][xBoost] = toCode(' ');

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter -= 2; // back-tracking
    }
  } else if (MAZE[yMazeNew][xMazeNew] === 36) { // if square is a dollar
    pointClear--; // remove 1 point from screen

    MAZE[yMazeNew][xMazeNew] = toCode(' ');

    if (xBoost === xMaze && yBoost === yMaze) { // NOT a boost move
      // leave trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(43);

      // mark location in maze as visited
      MAZE[yMaze][xMaze] = 43;

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter++; // moving forward
      mazeScore += 100; // 100 points per dollar
    } else { // a boost move to a dollar
      // leave trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(43);
      cmd.gotoxy(xBoost+1, yBoost+1);
      cmd.cout(43);

      // mark location in maze as visited
      MAZE[yMaze][xMaze] = 43;
      MAZE[yBoost][xBoost] = 43;

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter += 2; // moving forward
      mazeScore += 200; // 200 points per dollar with boost
    }
  } else if (MAZE[yMazeNew][xMazeNew] === 15) { // if square is a booster
    boostClear--; // remove 1 boost from screen

    MAZE[yMazeNew][xMazeNew] = toCode(' ');

    if (xBoost === xMaze && yBoost === yMaze) { // NOT a boost move
      // leave trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(43);

      // mark location in maze as visited
      MAZE[yMaze][xMaze] = 43;

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter++; // moving forward
      boost += 11; // 10 moves per boost ( decremented at end of move(); )
    } else { // a boost move to another booster
      // leave trail of dots
      cmd.gotoxy(xMaze+1, yMaze+1);
      cmd.cout(43);
      cmd.gotoxy(xBoost+1, yBoost+1);
      cmd.cout(43);

      // mark location in maze as visited
      MAZE[yMaze][xMaze] = 43;
      MAZE[yBoost][xBoost] = 43;

      // set new position of cursor
      xMaze = xMazeNew;
      yMaze = yMazeNew;

      cmd.gotoxy(xMaze+1, yMaze+1); // account for offset maze position

      // output new cursor
      cmd.cout(1);

      moveCounter += 2; // moving forward
      boost += 11; // 10 moves per boost ( decremented at end of move(); )
    }
  } else if (MAZE[yMazeNew][xMazeNew] === toCode('X') || MAZE[yBoost][xBoost] === toCode('X')) {
    return 1;
  }

  if (boost > 0) {
    boost--;
    showBoost();
  } else {
    cmd.gotoxy(45, 24);
    cmd.cout('            ');
  }

  return 0;
}

// generates a maze and saves it in MAZE[][];
function generateMaze() {
  // reset MAZE to blank (new maze)
  for (let r = 0; r < mazeHeight; r++) {
    for (let c = 0; c < mazeWidth; c++) {
      MAZE[r][c] = toCode(' ');
    }
  }

  // initialize the outer edge of MAZE (not including entrance/exit)
  for (let counter = 0; counter < mazeWidth; counter++) {
    MAZE[0][counter] = 177;
    MAZE[mazeHeight-1][counter] = 177;
  }
  // initialize the "filler" pieces and walls with side edges
  for (let row = 1; row < mazeHeight-1; row++) {
    MAZE[row][0] = 177; // left edge

    for (let col = 1; col < mazeWidth-1; col++) {
      if (col % 2 === 0 || row % 2 === 0) { // if the square is not a cell
        MAZE[row][col] = 177;
      }
    }

    MAZE[row][mazeWidth-1] = 177; // right edge
  }

  // bool to check if maze is complete each loop
  let mazeDone = false;

  // create the extrance and exit
  entrance = floor(random(RTotal));
  mazeExit = floor(random(RTotal));
  MAZE[entrance*2+1][0] = 1; // entrance
  MAZE[mazeExit*2+1][mazeWidth-1] = toCode('X'); // exit
  yMaze = entrance*2+1; // initialize starting position

  let wallCounter = 0, currentWall = 0, randomWall = 0, currentRow = 0, currentCol = 0;
  let currentCell1 = 0, currentCell2 = 0, currentSet1 = 0, currentSet2 = 0;

  const wallTotal = ((RTotal - 1) * CTotal) + ((CTotal - 1) * RTotal);
  const wallVTotal = ((CTotal - 1) * RTotal);
  const cellTotal = RTotal * CTotal;

  // walls[#][0] = first cell next to wall #
  // walls[#][1] = second cell next to wall #
  let walls = new Array(wallTotal).fill().map(_ => new Array(2));

  // used to track which walls have been removed
  let wallList = new Array(wallTotal).fill().map((_, i) => i);

  // used to track which cells are in which "sets"
  let cells = new Array(cellTotal).fill().map((_, i) => i);

  // initialize walls[][]
  for (let wallsV = 0; wallsV < wallVTotal; wallsV++) {
    walls[wallsV][0] = (wallsV + floor(wallsV / (CTotal-1)));
    walls[wallsV][1] = (walls[wallsV][0] + 1);
  }
  for (let wallsH = wallVTotal; wallsH < wallTotal; wallsH++) {
    walls[wallsH][0] = wallsH - wallVTotal;
    walls[wallsH][1] = (walls[wallsH][0] + CTotal);
  }

  // create the maze by randomly removing walls
  do
  {
    mazeDone = true; // if still true at the end, the maze is complete

    randomWall = floor(random(wallTotal - wallCounter));

    currentWall = wallList[randomWall];

    // remove the selected wall from the list
    for (let counter = randomWall; counter < (wallTotal - wallCounter - 1); counter++) {
      wallList[counter] = wallList[counter+1]; // overwrites currentWall and moves remaining walls over
    }

    wallList[wallTotal - wallCounter - 1] = 0; // remove garbage values at the end of the array

    wallCounter++; // increment loop counter
    
    // find the ID's of the cells being separated by the wall
    currentCell1 = walls[currentWall][0];
    currentCell2 = walls[currentWall][1];
    currentSet1 = cells[currentCell1];
    currentSet2 = cells[currentCell2];

    if (currentSet1 !== currentSet2) { // if the cells are in different sets
      // remove the wall
      if (currentWall < wallVTotal) { // vertical walls
        currentRow = (floor(currentWall / (CTotal - 1)) * 2) + 1;
        currentCol = ((currentWall % (CTotal - 1)) + 1) * 2;
      } else { // horizontal walls
        currentRow = (floor((currentWall - wallVTotal) / CTotal) + 1) * 2;
        currentCol = (((currentWall - wallVTotal) % CTotal) * 2) + 1;
      }

      MAZE[currentRow][currentCol] = toCode(' ');

      // add all cells in cell 2's set to cell 1's set (join the sets)
      for (let counter = 0; counter < cellTotal; counter++) {
        if (cells[counter] === currentSet2) {
          cells[counter] = currentSet1;
        }
      }
    }

    // all cells will be a part of the same set when the maze is complete
    for (let counter = 0; counter < (cellTotal - 1); counter++) {
      if (cells[counter] !== cells[counter+1]) { // if any cell is not in set 0...
        mazeDone = false; // ...the maze is not done
        break;
      }
    }

  } while (mazeDone === false);
}

// generates some point-getters
function generatePoints() {
  // generate 10 dollars per level
  for(let points = 0; points < (mazeLevel * 10); points++) {
    const xPoint = floor(random(CTotal));
    const yPoint = floor(random(RTotal));

    // set coordinates to randomly selected row/column
    xCoord = (xPoint * 2) + 2;
    yCoord = (yPoint * 2) + 2;

    if (MAZE[yCoord - 1][xCoord - 1] === toCode(' ')) { // make sure the space is empty (no dollar or boost)
      MAZE[yCoord - 1][xCoord - 1] = 36;
      pointClear++; // 1 more point on screen
    } else {
      points--; // if same location generated twice, try again
    }
  }

  // generate 1 boost per level
  for(let boosts = 0; boosts < mazeLevel; boosts++) {
    const xPoint = floor(random(CTotal));
    const yPoint = floor(random(RTotal));

    // set coordinates to randomly selected row/column
    xCoord = (xPoint * 2) + 2;
    yCoord = (yPoint * 2) + 2;

    if (MAZE[yCoord - 1][xCoord - 1] === toCode(' ')) { // make sure the space is empty (no dollar or boost)
      MAZE[yCoord - 1][xCoord - 1] = 15;
      boostClear++; // 1 more boost on screen
    } else {
      boosts--; // if same location generated twice, try again
    }
  }
}

async function showVeziPlayLogo() {
	/* ---\/--- VEZI-PLAY LOGO START ---\/--- */
  const veziPlayLogo = [
    " ..................     ............... ",
    "..::::::::::::::::..   ..:::::::::::::..",
    "..::VVMW8888WMVV::..   ..::VVMW8WMVV::..",
    " ..:::VMW888WMV::..      ..::VMMMV:::.. ",
    "  ..:::VMW88WMV::..       ..::VMV:::..  ",
    "   ..:::VMW8WMV::..       ..::VV:::..   ",
    "    ..:::VMW8WMV::..     ..::VV:::..    ",
    "     ..:::VMW8WMV::..   ..::VV:::..     ",
    "      ..:::VMW8WMV::.. ..::VV:::..      ",
    "       ..:::VMW8WMV::...::VV:::..       ",
    "        ..:::VMW8WMV::.::VV:::..        ",
    "         ..:::VMW8WMV:::VV:::..         ",
    "          ..:::VMW8WMV:VV:::..          ",
    "           ..:::VMW8WMVV:::..           ",
    "            ..:::VMWWMV:::..            ",
    "             ..:::VMMV:::..             ",
    "              ..:::VV:::..              ",
    "               ..::::::..               ",
    "                ........                ",
  ];
  cmd.endl().endl();
  await sleep(1000);
  cmd.systemColor('F7');
  await sleep(100);
  cmd.systemColor('78');
  for (let row = 0; row < veziPlayLogo.length; row++) {
    cmd.cout('                    ');
    cmd.cout(veziPlayLogo[row]).endl();
  };
  cmd.endl().cout('                        ');
  await sleep(100);
  cmd.systemColor('82');
  await sleep(100);
  cmd.systemColor('2A');
  await sleep(500);
  cmd.cout('V   ');
  await sleep(100);
  cmd.cout('E   ');
  await sleep(100);
  cmd.cout('Z   ');
  await sleep(100);
  cmd.cout('I   ');
  await sleep(100);
  cmd.cout('-   ');
  await sleep(100);
  cmd.cout('P   ');
  await sleep(100);
  cmd.cout('L   ');
  await sleep(100);
  cmd.cout('A   ');
  await sleep(100);
  cmd.cout('Y');
  await sleep(3000);
  cmd.systemColor('3A');
  await sleep(100);
  cmd.systemColor('1A');
  await sleep(100);
  cmd.systemColor('2');
  await sleep(100);
  cmd.clear();
  cmd.systemColor('7');
  await sleep(1000);
	/* ---/\--- VEZI-PLAY LOGO END ---/\--- */
}
