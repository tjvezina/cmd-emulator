let cmdEmulator;

let maze;
let mazeName;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  cmdEmulator = new CmdEmulator({ main: main, exeName: 'Hedge Mazes 2.0' });
}

function draw() {
  cmdEmulator.draw();
}

async function main() {
  cmd.setConsoleTitle('Hedge Mazes 2.0');
  cmd.setFont(ASCIIFontType.Square);

  let option = -1;

  // Main Menu Loop
  while (option !== 2) {
    option = await mainMenu();

    switch (option) {
      case 1: // New Maze
        await generateMaze(true);
        await cmd.resize(maze.sizeX, maze.sizeY);
        // Draw and update the game until IsGameOver() returns 'true'
        while (!maze.isGameOver()) {
          maze.draw();
          await maze.update();
        }
        await endGame();
        break;
    }
  }
  
  BGMusic.stop();
  return 0;
}

async function mainMenu() {
  // Display the main menu
  cmd.clear();
  await cmd.resize(79, 79);
  BGMusic.playSong('Main');

  cmd.systemColor(Color.Green, Color.DarkBlue);

  cmd.centerString(5, 'M A I N   M E N U');
  
  cmd.centerString(10, '[1] Generate New Maze');
  cmd.centerString(12, '[2] Quit');

  // Wait for valid input for the menu (either a 1 or 2)
  let option = '\0';
  while (option < '1' || option > '2') {
    option = await cmd.getch();
  }

  // Return the option picked as an int
  return Number(option);
}

async function generateMaze(isNew) {
  cmd.clear();

  cmd.centerString(5, 'M A Z E   G E N E R A T I O N');

  // Ask for the dimensions of the new maze
  if (isNew) {
    let w = 0, h = 0, s = 0;

    cmd.centerString(8, 'Enter maze width (16-39):');

    while (w < 16 || w > 39) {
      cmd.gotoxy(39, 9);
      cmd.cout('         ');
      cmd.gotoxy(39, 9);
      w = Number(await cmd.getline({ limit: 2, include: /[0-9]/ }));
    }

    cmd.centerString(11, 'Enter maze height (16-39):');

    while (h < 16 || h > 39) {
      cmd.gotoxy(39, 12);
      cmd.cout('         ');
      cmd.gotoxy(39, 12);
      h = Number(await cmd.getline({ limit: 2, include: /[0-9]/ }));
    }

    cmd.centerString(14, 'Enter a random seed:');

    while (s <= 0) {
      cmd.gotoxy(39, 15);
      cmd.cout('         ');
      cmd.gotoxy(39, 15);
      s = Number(await cmd.getline({ limit: 9, include: /[0-9]/ }));
    }

    maze = new Maze(w, h, s);

    cmd.clear();
    cmd.systemColor(Color.White, Color.Black);
  }
}

async function endGame() {
  // Once the game loop ends, play the game over music
  BGMusic.playSong('GameOver', false);

  cmd.setBackColor(Color.Black);
  cmd.setForeColor(Color.Yellow);

  let x = round((cmd.gridSize.width - 21) / 2);
  let y = round((cmd.gridSize.height - 5) / 2);
  cmd.gotoxy(x,   y);
  cmd.cout('#####################');
  cmd.gotoxy(x, ++y);
  cmd.cout('#                   #');
  cmd.gotoxy(x, ++y);
  cmd.cout('#  Y O U   W I N !  #');
  cmd.gotoxy(x, ++y);
  cmd.cout('#                   #');
  cmd.gotoxy(x, ++y);
  cmd.cout('#####################');

  await cmd.getch();
}
