class Color {
  static Black     = 0x0;
  static DarkBlue  = 0x1;
  static DarkGreen = 0x2;
  static Teal      = 0x3;
  static DarkRed   = 0x4;
  static Purple    = 0x5;
  static DarkYell  = 0x6;
  static Gray      = 0x7;
  static DarkGray  = 0x8;
  static Blue      = 0x9;
  static Green     = 0xA;
  static Cyan      = 0xB;
  static Red       = 0xC;
  static Magenta   = 0xD;
  static Yellow    = 0xE;
  static White     = 0xF;
}
const COLOR_VALUES = [
  '#000000', '#000080', '#008000', '#008080', '#800000', '#800080', '#808000', '#C0C0C0',
  '#808080', '#0000FF', '#00FF00', '#00FFFF', '#FF0000', '#FF00FF', '#FFFF00', '#FFFFFF',
];

const CMD_ASSET_PATH = '../library/cmd-emulator/assets';

const DEFAULT_GRID_WIDTH = 80;
const DEFAULT_GRID_HEIGHT = 25;

const TAB_WIDTH = 8;

const ANIMATE_FPS = 24;
const ANIMATE_SPEED = 1000; // Pixels per second

// Make the cmd instance globally accessible
let cmd;

class CmdEmulator {
  static desktopBackground;
  static appIcon;
  static systemFont;

  static {
    wrapP5Events(this, 'preload');
  }

  static preload() {
    loadImage(`${CMD_ASSET_PATH}/desktop-background.png`, result => this.desktopBackground = result);
    loadImage(`${CMD_ASSET_PATH}/app-icon.png`, result => this.appIcon = result);
    
    loadFont(`${CMD_ASSET_PATH}/Segoe UI.ttf`, result => this.systemFont = result);
  }

  main;
  exeName = 'cmd.exe';

  wasDoubleClicked = false;

  constructor({ main, exeName }) {
    this.main = main;
    this.exeName = exeName ?? this.exeName;
    if (!this.exeName.endsWith('.exe')) {
      this.exeName += '.exe';
    }

    wrapP5Events(this, 'doubleClicked', 'keyPressed');
  }

  draw() {
    const { appIcon, systemFont } = CmdEmulator;
    const { exeName } = this;

    clear();
    this.drawBackground();

    if (cmd !== undefined) {
      cmd.draw();
      return;
    }

    textFont(systemFont);
    textAlign(RIGHT, CENTER);
    textSize(16);
    
    const appIconWidth = 20;
    const appIconHeight = appIconWidth / (appIcon.width/appIcon.height);
    const totalWidth = appIconWidth*1.5 + textWidth(exeName);

    const highlightRect = {
      x: (width - totalWidth) / 2 - 6,
      y: (height - appIconHeight) / 2 - 6,
      width: totalWidth + 12,
      height: appIconHeight + 12,
    };

    const isMouseInRect = (
      mouseX >= highlightRect.x && mouseX < highlightRect.x + highlightRect.width &&
      mouseY >= highlightRect.y && mouseY < highlightRect.y + highlightRect.height
    );

    noStroke();
    noFill();
    if (isMouseInRect) {
      strokeWeight(2);
      stroke('#cce8ffC0');
      fill('#cce8ff80');
    }
    rect(highlightRect.x, highlightRect.y, highlightRect.width, highlightRect.height);

    tint(0, 63);
    image(appIcon, (width - totalWidth) / 2 - 1, (height - appIconHeight) / 2 + 1, appIconWidth, appIconHeight);
    image(appIcon, (width - totalWidth) / 2 + 1, (height - appIconHeight) / 2 + 1, appIconWidth, appIconHeight);
    noTint();
    image(appIcon, (width - totalWidth) / 2, (height - appIconHeight) / 2, appIconWidth, appIconHeight);

    noFill();
    strokeWeight(2);
    stroke(0, 96);
    text(exeName, (width + totalWidth) / 2 - 0.5, height/2 - 2);
    text(exeName, (width + totalWidth) / 2 + 0.5, height/2 - 2);
    noStroke();
    fill(255);
    text(exeName, (width + totalWidth) / 2, height/2 - 3);
    text(exeName, (width + totalWidth) / 2, height/2 - 3);

    if (this.wasDoubleClicked && isMouseInRect) {
      this.execute();
    }

    this.wasDoubleClicked = false;
  }

  doubleClicked() {
    if (cmd === undefined) {
      this.wasDoubleClicked = true;
    }
  }

  keyPressed(event) {
    cmd?.keyPressed(event);
  }

  drawBackground() {
    const { desktopBackground } = CmdEmulator;

    const canvasAR = width/height;
    const backgroundAR = desktopBackground.width/desktopBackground.height;

    let renderWidth, renderHeight;
    if (canvasAR > backgroundAR) {
      renderWidth = max(width, desktopBackground.width);
      renderHeight = renderWidth / backgroundAR;
    } else {
      renderHeight = max(height, desktopBackground.height);
      renderWidth = renderHeight * backgroundAR;
    }

    push();
    {
      imageMode(CENTER);
      image(desktopBackground, width/2, height/2, renderWidth, renderHeight);
    }
    pop();
  }

  async execute() {
    cmd = new Cmd();

    await this.main(cmd);

    cmd.remove();
    cmd = undefined;
  }
}

class ASCIIFontType {
  static get Default() { return 'default'; }
  static get Square() { return 'square'; }
}

class ASCIIFont {
  fontMap;
  colorMap;
  charWidth;
  charHeight;

  constructor(fontMap) {
    this.fontMap = fontMap;
    this.charWidth = fontMap.width / 16;
    this.charHeight = fontMap.height / 16;
  }

  init() {
    const { fontMap } = this;

    // tint() performance is so bad, it's better to save each color individually
    this.colorMap = createGraphics(fontMap.width*4, fontMap.height*4);
    COLOR_VALUES.forEach((col, i) => {
      const x = (i % 4) * fontMap.width;
      const y = floor(i / 4) * fontMap.height;
      this.colorMap.tint(col);
      this.colorMap.image(fontMap, x, y);
    });
  }
}

class Cmd {
  static asciiFontSet = {};
  static asciiFont;
  static frameParts = {};

  static {
    wrapP5Events(this, 'preload', 'setup');
  }

  static preload() {
    loadImage(`${CMD_ASSET_PATH}/ascii-font-8x12.png`, result => {
      this.asciiFontSet[ASCIIFontType.Default] = new ASCIIFont(result);
    });
    loadImage(`${CMD_ASSET_PATH}/ascii-font-8x8.png`, result => {
      this.asciiFontSet[ASCIIFontType.Square] = new ASCIIFont(result);
    });

    const framePartNames = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];
    framePartNames.forEach(partName => {
      loadImage(`${CMD_ASSET_PATH}/cmd-frame-${partName}.png`, result => {
        this.frameParts[partName] = result;
      });
    });
  }

  static setup() {
    Object.values(this.asciiFontSet).forEach(font => font.init());

    this.asciiFont = this.asciiFontSet[ASCIIFontType.Default];
  }

  title = 'C:\\Windows\\system32\\cmd.exe';

  gridSize = { width: DEFAULT_GRID_WIDTH, height: DEFAULT_GRID_HEIGHT };
  pixelSize = { width: 0, height: 0 };

  cursor = { x: 0, y: 0 };

  // Main p5.Graphics object for drawing the CMD window and content
  graphics;
  // Mirror of char codes rendered on the screen, used when re-drawing in a new color (see `systemColor()`)
  contentBuffer;

  foreColor = Color.Gray;
  backColor = Color.Black;

  lastKeyEvent;

  constructor() {
    this.resize(null, null, { force: true, animate: false });
  }

  remove() {
    this.graphics?.remove();
  }

  draw() {
    const { graphics, pixelSize, title } = this;
    const { appIcon, systemFont } = CmdEmulator;
    const { tl, t, tr, l, r, bl, b, br } = Cmd.frameParts;

    if (graphics === undefined) {
      return;
    }

    // Translate by a whole number of pixels to display the console properly
    translate(
      round((width - pixelSize.width - l.width - r.width) / 2),
      round((height - pixelSize.height - t.height - b.height) / 2)
    );

    // Window Frame
    const cmdWidth = pixelSize.width + l.width + r.width;
    const cmdHeight = pixelSize.height + t.height + b.height;

    image(tl, 0, 0);
    image(t, tl.width, 0, cmdWidth - tl.width - tr.width, t.height);
    image(tr, cmdWidth - tr.width, 0);

    image(l, 0, tl.height, l.width, cmdHeight - tl.height - bl.height);
    image(r, cmdWidth - r.width, tr.height, r.width, cmdHeight - tr.height - br.height);

    image(bl, 0, cmdHeight - bl.height);
    image(b, bl.width, cmdHeight - b.height, cmdWidth - bl.width - br.width, b.height);
    image(br, cmdWidth - br.width, cmdHeight - br.height);

    // Icon & Title
    image(appIcon, l.width, t.height/2 - 7, 16, 16 / (appIcon.width/appIcon.height));

    const titleX = l.width + 24;
    const titleY = t.height/2 - 2;

    noStroke();
    textFont(systemFont);
    textAlign(LEFT, CENTER);
    textSize(12);
    noFill();
    strokeWeight(8); stroke('#FFFFFF08'); text(title, titleX, titleY);
    strokeWeight(6); stroke('#FFFFFF18'); text(title, titleX, titleY);
    strokeWeight(4); stroke('#FFFFFF28'); text(title, titleX, titleY);
    strokeWeight(2); stroke('#FFFFFF38'); text(title, titleX, titleY);
    noStroke();
    fill(0);
    text(title, titleX, titleY);

    translate(l.width, t.height);
    
    // Durating window resize animation, the graphics object size and pixel size may differ
    const overlapWidth = min(pixelSize.width, graphics.width);
    const overlapHeight = min(pixelSize.height, graphics.height);
    fill(COLOR_VALUES[this.backColor]);
    rect(0, 0, pixelSize.width, pixelSize.height);
    image(graphics, 0, 0, overlapWidth, overlapHeight, 0, 0, overlapWidth, overlapHeight);
  }

  keyPressed(event) {
    this.lastKeyEvent = event;
  }

  setFont(type) {
    Cmd.asciiFont = Cmd.asciiFontSet[type];
    this.resize(null, null, { force: true, animate: false });
  }

  setConsoleTitle(title) {
    this.title = title;
  }

  gotoxy(x, y) {
    this.cursor = {
      x: constrain(round(x), 0, this.gridSize.width-1),
      y: constrain(round(y), 0, this.gridSize.height-1),
    };
  }

  advanceCursor() {
    if (++this.cursor.x >= this.gridSize.width) {
      this.endl();
    }
  }

  /*
    The separation between keyboard key presses and printable ASCII characters are handled differently in C++ and JS.
    The original C stdlib _getch() would return a char for the key pressed, sometimes requiring a second call to get
      a secondary char indicating a special key, like the arrow keys.
    In JS, there is no `char` primitive that can be treated as either a string or number, so we return a one-character
      string when possible, or the pressed keyCode (number) otherwise. The calling code only has to call getch() once,
      but must differentiate between strings and numbers if it cares.
    NOTE: To allow returning capital letters and other symbols, modifier keys are ignored.
  */
  async getch({ onInterval, interval = 100 } = {}) {
    // Ignore modifier keys, or other keys while a modified is held, except shift
    function isValidEvent(event) {
      return event !== undefined && event.keyCode !== TAB &&
        !event.ctrlKey && !event.altKey && !event.metaKey && event.keyCode !== SHIFT;
    }

    let lastIntervalTime = millis();
    this.lastKeyEvent = undefined;
    do {
      await sleep(0);
      if (onInterval !== undefined && (millis() - lastIntervalTime) > interval) {
        lastIntervalTime = millis();
        const cancel = onInterval();
        if (cancel === true) {
          return null;
        }
      }
    } while (!isValidEvent(this.lastKeyEvent));
    
    const event = this.lastKeyEvent;
    this.lastKeyEvent = undefined;
    
    return (event.key.length === 1 ? event.key : event.keyCode);
  }

  async pause({ onInterval, interval } = {}) {
    this.cout('Press any key to continue . . . ');
    await this.getch({ onInterval, interval });
  }

  // Mimics basic text input until the user hits enter or escape. Text wrapping is not allowed.
  async getline({ limit = Infinity, isPassword = false, include, exclude } = {}) {
    const insertChar = (function(char) {
      input += char;
      this.cout(isPassword === true ? '*' : char);
    }).bind(this);

    const removeChar = (function() {
      input = input.substring(0, input.length - 1);
      this.cursor.x--;
      this.cout(' ');
      this.cursor.x--;
    }).bind(this);

    limit = (Number.isFinite(limit) ? limit : this.gridSize.width - this.cursor.x - 1);

    let input = '';
    let key = await this.getch();

    while (key !== ENTER || input.length == 0) {
      if (key === BACKSPACE && input.length > 0) {
        removeChar();
      }

      if (typeof key === 'string' && input.length < limit &&
        (key !== ' ' || input.length > 0 || isPassword === true) &&
        (include === undefined || include.test(key)) &&
        (exclude === undefined || !exclude.test(key))
      ) {
        insertChar(key);
      }

      key = await this.getch();
    }

    return (isPassword ? input : input.trim());
  }

  setColor(colorCode) {
    this.backColor = floor(colorCode / 16);
    this.foreColor = colorCode % 16;
  }

  setForeColor(col) {
    this.foreColor = col;
  }

  setBackColor(col) {
    this.backColor = col;
  }

  // Redraws the console all in one color (equivalent to C++ stdlib system("color XX") function)
  systemColor(...args) {
    const { contentBuffer, gridSize } = this;

    if (typeof args[0] === 'string') {
      const colorCode = args[0];
      [this.backColor, this.foreColor] = [...colorCode.padStart(2, '0')].map(i => parseInt(i, 16));
    } else {
      this.foreColor = args[0];
      this.backColor = args[1];
    }

    this.fillBackground();

    const prevCursor = this.cursor;

    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        const code = contentBuffer[x + y*gridSize.width];
        if (code !== undefined && code !== toCode(' ')) {
          this.gotoxy(x, y);
          this.printCharCode(code);
        }
      }
    }

    this.cursor = prevCursor;
  }

  clear() {
    this.fillBackground();
    
    this.contentBuffer.fill(undefined);
    this.cursor = { x: 0, y: 0 };
  }

  fillBackground() {
    const { graphics, pixelSize } = this;

    graphics.fill(COLOR_VALUES[this.backColor]);
    graphics.rect(0, 0, pixelSize.width, pixelSize.height);
  }

  endl() {
    this.cursor.x = 0;
    this.cursor.y = min(this.cursor.y + 1, this.gridSize.height - 1);
    return this;
  }

  cout(output) {
    if (typeof output === 'number') {
      this.printCharCode(output)
    } else {
      [...`${output ?? ''}`.replaceAll('\t', ' '.repeat(TAB_WIDTH))].forEach(char => {
        if (char === '\n') {
          this.endl();
        } else {
          this.printCharCode(toCode(char));
        }
      })
    }
    return this;
  }

  centerString(row, text) {
    let spacing = max(0, floor((this.gridSize.width - text.length) / 2));

    this.gotoxy(spacing, row);
    this.cout(text.substring(0, this.gridSize.width));
  }
  
  printCharCode(code) {
    if (!Number.isInteger(code) || code < 0 || code >= 256) {
      throw new Error('Invalid ascii code: ' + code);
    }

    const { graphics, contentBuffer } = this;
    const { fontMap, colorMap, charWidth, charHeight } = Cmd.asciiFont;

    const dx = this.cursor.x*charWidth;
    const dy = this.cursor.y*charHeight;
    
    graphics.fill(COLOR_VALUES[this.backColor]);
    graphics.rect(dx, dy, charWidth, charHeight);

    const cx = (this.foreColor % 4) * fontMap.width;
    const cy = floor(this.foreColor / 4) * fontMap.height;

    const sx = (code % 16) * (fontMap.width/16);
    const sy = floor(code / 16) * (fontMap.height/16);

    graphics.image(colorMap, dx, dy, charWidth, charHeight, sx+cx, sy+cy, charWidth, charHeight);

    contentBuffer[this.cursor.x + this.cursor.y*this.gridSize.width] = code;

    this.advanceCursor();

    return this;
  }

  async setWindowHeight(height) {
    const { t, b } = Cmd.frameParts;

    if (height === 0) {
      await this.resize(null, DEFAULT_GRID_HEIGHT);
    } else {
      await this.resize(null, (height - t.height - b.height) / Cmd.asciiFont.charHeight);
    }
  }

  async resize(gridWidth, gridHeight, { force = false, animate = true } = {}) {
    gridWidth = floor(gridWidth ?? this.gridSize.width);
    gridHeight = floor(gridHeight ?? this.gridSize.height);

    if (!force && gridWidth === this.gridSize.width && gridHeight === this.gridSize.height) {
      return;
    }

    const prevGridSize = this.gridSize;

    this.gridSize = { width: gridWidth, height: gridHeight };
    const nextPixelSize = { width: gridWidth * Cmd.asciiFont.charWidth, height: gridHeight * Cmd.asciiFont.charHeight };

    if (animate) {
      const { pixelSize } = this;

      while (pixelSize.width !== nextPixelSize.width || pixelSize.height !== nextPixelSize.height) {
        if (pixelSize.width < nextPixelSize.width) {
          pixelSize.width += ANIMATE_SPEED / ANIMATE_FPS;
          if (pixelSize.width >= nextPixelSize.width) {
            pixelSize.width = nextPixelSize.width;
          }
        } else if (pixelSize.width > nextPixelSize.width) {
          pixelSize.width -= ANIMATE_SPEED / ANIMATE_FPS;
          if (pixelSize.width <= nextPixelSize.width) {
            pixelSize.width = nextPixelSize.width;
          }
        }
        if (pixelSize.height < nextPixelSize.height) {
          pixelSize.height += ANIMATE_SPEED / ANIMATE_FPS;
          if (pixelSize.height >= nextPixelSize.height) {
            pixelSize.height = nextPixelSize.height;
          }
        } else if (pixelSize.height > nextPixelSize.height) {
          pixelSize.height -= ANIMATE_SPEED / ANIMATE_FPS;
          if (pixelSize.height <= nextPixelSize.height) {
            pixelSize.height = nextPixelSize.height;
          }
        }

        await sleep(1000/ANIMATE_FPS);
      }
    }

    this.pixelSize = nextPixelSize;

    const { gridSize, pixelSize } = this;

    const prevGraphics = this.graphics;
    const prevContentBuffer = this.contentBuffer;

    this.graphics = createGraphics(pixelSize.width, pixelSize.height);
    this.graphics.clear();
    this.graphics.noStroke();

    this.contentBuffer = new Array(gridSize.width * gridSize.height).fill(undefined);
    if (prevContentBuffer !== undefined) {
      for (let y = 0; y < min(prevGridSize.height, gridSize.height); y++) {
        for (let x = 0; x < min(prevGridSize.width, gridSize.width); x++) {
          this.contentBuffer[x + y*gridSize.width] = prevContentBuffer[x + y*prevGridSize.width];
        }
      }
    }

    this.fillBackground();

    if (prevGraphics !== undefined) {
      const overlapWidth = min(this.graphics.width, prevGraphics.width);
      const overlapHeight = min(this.graphics.height, prevGraphics.height);

      this.graphics.image(prevGraphics, 0, 0, overlapWidth, overlapHeight, 0, 0, overlapWidth, overlapHeight);

      prevGraphics.remove();
    }
  }
}