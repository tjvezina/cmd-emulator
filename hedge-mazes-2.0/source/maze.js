class Tile {
  static get Wall() { return 0; }
  static get Floor() { return 1; }
  static get Passed() { return 2; }
}

class Maze {
  sizeX;
  sizeY;
  seed;

  tiles;

  playerPosX;
  playerPosY;

  constructor(w, h, seed) {
    this.seed = seed;

    this.sizeX = w*2+1;
    this.sizeY = h*2+1;

    this.tiles = new Array(this.sizeX).fill().map(_ => new Array(this.sizeY));

    this.generate(w, h);
  }

  generate(w, h) {
    // Seed the randomizer to generate the desired maze
    // (Same seed means same maze every time!)
    randomSeed(this.seed);

    // Initialize the 2D array for each maze cell
    const maze = new Array(w).fill().map(_ => new Array(h));

    // Hold all the walls in a single array
    const walls = [];

    // For each cell, set the group ID and adjascent walls
    for (let y = 0; y < h; ++y) {
      for (let x = 0; x < w; ++x) {
        const index = y*w + x;

        maze[x][y] = index;

        // Horizontal walls
        if (x < w-1) {
          walls.push({
            a: index,
            b: index + 1,
            x: x * 2 + 2,
            y: y * 2 + 1,
          });
        }
        // Vertical walls
        if (y < h-1) {
          walls.push({
            a: index,
            b: index + w,
            x: x * 2 + 1,
            y: y * 2 + 2,
          });
        }
      }
    }

    let groupCount = w * h;

    // Iterate over the maze until every cell is in the same group
    while (groupCount > 1) {
      const i = floor(random(walls.length));

      const wall = walls[i];

      // If this random wall is separating different groups...
      if (wall.a !== wall.b) {
        const oldGroup = wall.b;
        const newGroup = wall.a;

        walls.splice(i, 1);
        --groupCount;

        // Search the maze for oldGroup and convert to newGroup
        for (let y = 0; y < h; ++y) {
          for (let x = 0; x < w; ++x) {
            if (maze[x][y] = oldGroup) {
              maze[x][y] = newGroup;
            }
          }
        }

        // Update the list of walls, also converting old to new
        for (let x = 0; x < walls.length; ++x) {
          const wall2 = walls[x];

          if (wall2.a === oldGroup) wall2.a = newGroup;
          if (wall2.b === oldGroup) wall2.b = newGroup;
        }
      }
    }

    // Initialize the tile array to display as walls or floors
    for (let y = 0; y < this.sizeY; ++y) {
      for (let x = 0; x < this.sizeX; ++x) {
        if (y === 0 || y === this.sizeY-1 || x === 0 || x === this.sizeX-1 || (x%2 === 0 && y%2 === 0)) {
          this.tiles[x][y] = Tile.Wall;
        } else {
          this.tiles[x][y] = Tile.Floor;
        }
      }
    }

    // Fill in all the walls left from generation to create the maze!
    for (let x = 0; x < walls.length; ++x) {
      this.tiles[walls[x].x][walls[x].y] = Tile.Wall;
    }

    // Set the player position over the entrance
    this.playerPosX = 0;
    this.playerPosY = 1;

    // Leave holes for the entrance and exit (top left + bottom right)
    this.tiles[this.playerPosX][this.playerPosY] = Tile.Floor;
    this.tiles[w*2][h*2-1] = Tile.Floor;
  }

  draw() {
    for (let y = 0; y < this.sizeY; ++y) {
      for (let x = 0; x < this.sizeX; ++x) {
        const level = this.lightLevel(x, y);

        if (level === 0) continue;

        const t = this.tiles[x][y];

        if (level === 1) cmd.setForeColor(t === Tile.Wall ? Color.DarkBlue  : Color.DarkGray);
        if (level === 2) cmd.setForeColor(t === Tile.Wall ? Color.DarkGreen : Color.Gray);
        if (level === 3) cmd.setForeColor(t === Tile.Wall ? Color.Green     : Color.White);

        if (t === Tile.Passed) cmd.setForeColor(level > 1 ? Color.Red : Color.DarkRed);

        cmd.gotoxy(x, y);
        cmd.cout(t === Tile.Wall ? 'X' : (t === Tile.Passed ? 42 : 250)); // If dots are wrong, try 249 or 250 :)
      }
    }

    cmd.gotoxy(this.playerPosX, this.playerPosY);
    cmd.setForeColor(Color.Yellow);
    cmd.cout(2);
    cmd.gotoxy(0, 0);
  }

  async update() {
    let input = '\0';

    input = await cmd.getch();

    let moveTargetX = this.playerPosX;
    let moveTargetY = this.playerPosY;
    let middleTileX = moveTargetX;
    let middleTileY = moveTargetY;

    switch (input) {
      case LEFT_ARROW:  moveTargetX -= 2; middleTileX -= 1; break;
      case RIGHT_ARROW: moveTargetX += 2; middleTileX += 1; break;
      case UP_ARROW:    moveTargetY -= 2; middleTileY -= 1; break;
      case DOWN_ARROW:  moveTargetY += 2; middleTileY += 1; break;
      default:
        return;
    }

    if (moveTargetX % 2 === 0) --moveTargetX;
    if (moveTargetX >= this.sizeX) --moveTargetX;

    if (moveTargetX < 0 || moveTargetX >= this.sizeX ||
        moveTargetY < 0 || moveTargetY >= this.sizeY
    ) {
      return;
    }

    if (this.tiles[moveTargetX][moveTargetY] !== Tile.Wall &&
        this.tiles[middleTileX][middleTileY] !== Tile.Wall
    ) {
      const passed = (this.tiles[moveTargetX][moveTargetY] !== Tile.Passed);
      this.tiles[this.playerPosX][this.playerPosY] = (passed ? Tile.Passed : Tile.Floor);

      if (moveTargetX !== middleTileX || moveTargetY !== middleTileY) {
        this.tiles[middleTileX][middleTileY] = (passed ? Tile.Passed : Tile.Floor);
      }

      this.playerPosX = moveTargetX;
      this.playerPosY = moveTargetY;
    }
  }

  lightLevel(x, y) {
    const distX = x - this.playerPosX;
    const distY = y - this.playerPosY;
    const len = sqrt(distX*distX + distY*distY);

    if (len < 4) return 3;
    if (len < 6) return 2;
    if (len < 8) return 1;

    return 0;
  }

  // Game over condition - player passes right edge of maze
  isGameOver() { return this.playerPosX >= this.sizeX - 1; }
}