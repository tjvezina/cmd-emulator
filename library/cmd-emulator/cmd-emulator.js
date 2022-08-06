async function sleep(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

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

const CMD_ASSET_PATH = '/library/cmd-emulator/assets';

const DEFAULT_GRID_WIDTH = 80;
const DEFAULT_GRID_HEIGHT = 25;

const TAB_WIDTH = 8;

// Map JavaScript key codes to an array of characters - the first is normal, the second when holding SHIFT
const KEY_TO_CHAR = {
  ...new Array(26).fill().reduce((acc, _, i) => {
    acc[i + toCode('A')] = [toChar(toCode('a') + i), toChar(toCode('A') + i)];
    return acc;
  }, {}),
  ...new Array(10).fill().reduce((acc, _, i) => {
    acc[i + toCode('0')] = [`${i}`, [')', '!', '@', '#', '$', '%', '^', '&', '*', '('][i]];
    acc[i + 96] = [`${i}`]; // Numpad digits
    return acc;
  }, {}),
  32: [' '], 106: ['*'], 107: ['+'], 108: ['.'], 109: ['-'], 110: ['.'], 111: ['/'],
  186: [';', ':'], 187: ['=', '+'], 188: [',', '<'], 189: ['-', '_'], 190: ['.', '>'], 191: ['/', '?'],
  192: ['`', '~'], 219: ['[', '{'], 220: ['\\', '|'], 221: [']', '}'], 222: ['\'', '"'],
};

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

  keyPressed() {
    cmd?.keyPressed();
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

class Cmd {
  static asciiFontMap;
  static asciiFontColorMap;
  static charWidth;
  static charHeight;
  static frameParts = {};

  static {
    wrapP5Events(this, 'preload', 'setup');
  }

  static preload() {
    // Load the ascii font map, a 16x16 character font image
    loadImage(`${CMD_ASSET_PATH}/ascii-font.png`, result => {
      this.asciiFontMap = result;
      this.charWidth = this.asciiFontMap.width/16;
      this.charHeight = this.asciiFontMap.height/16;
    });

    const framePartNames = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];
    framePartNames.forEach(partName => {
      loadImage(`${CMD_ASSET_PATH}/cmd-frame-${partName}.png`, result => {
        this.frameParts[partName] = result;
      });
    });
  }

  static setup() {
    const { asciiFontMap } = this;

    // tint() performance is so bad, it's better to save each color individually
    this.asciiFontColorMap = createGraphics(asciiFontMap.width*4, asciiFontMap.height*4);
    COLOR_VALUES.forEach((col, i) => {
      const x = (i % 4) * asciiFontMap.width;
      const y = floor(i / 4) * asciiFontMap.height;
      this.asciiFontColorMap.tint(col);
      this.asciiFontColorMap.image(asciiFontMap, x, y);
    });
  }

  title = 'C:\\Windows\\system32\\cmd.exe';

  gridSize = { width: DEFAULT_GRID_WIDTH, height: DEFAULT_GRID_HEIGHT };
  pixelSize = { width: 0, height: 0 };

  cursor = { x: 0, y: 0 };

  // Main p5.Graphics object for drawing the CMD window and content
  graphics;
  // Mirrors the current foreground content in white for quick redraw in a new color (see `systemColor()`)
  contentBuffer;

  foreColor = Color.Gray;
  backColor = Color.Black;

  wasKeyPressed = false;

  constructor() {
    this.onResized();
  }

  remove() {
    this.graphics?.remove();
    this.contentBuffer?.remove();
  }

  draw() {
    const { graphics } = this;
    image(graphics, round((width - graphics.width) / 2), round((height - graphics.height) / 2));
  }

  keyPressed() {
    this.wasKeyPressed = true;
  }

  setConsoleTitle(title) {
    this.title = title;
    this.drawTitle();
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
    In JS, there is no built-in bridge between keys and chars, and no `char` primitive, so we attempt to convert each
      keyCode to a character, returning it in a string if successful, or the keyCode number otherwise. The calling
      code only has to call getch() once, but must differentiate between strings and numbers if it cares.
    NOTE: To allow returning capital letters and other symbols, modifier keys are ignored.
    NOTE: Spacebar is both a char and a special key, but char takes precedence so ' ' is returned, not 32.
  */
  async getch() {
    this.wasKeyPressed = false;
    do {
      await sleep(0);
    } while (!this.wasKeyPressed || [SHIFT, CONTROL, ALT, OPTION].includes(keyCode));
    this.wasKeyPressed = false;

    // Return char if possible, else return key code
    return KEY_TO_CHAR[keyCode]?.[keyIsDown(SHIFT) ? 1 : 0] ?? keyCode;
  }

  async pause() {
    this.cout('Press any key to continue . . . ');
    await this.getch();
  }

  // Mimics basic text input until the user hits enter or escape. Text wrapping is not allowed.
  async cin({ limit = Infinity, isPassword = false } = {}) {
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

    while (key !== ENTER && key !== ESCAPE) {
      if (key === BACKSPACE && input.length > 0) {
        removeChar();
      }

      if (typeof key === 'string' && input.length < limit) {
        insertChar(key);
      }

      key = await this.getch();
    }

    this.endl();
    return input;
  }

  setColor(colorCode) {
    this.backColor = floor(colorCode / 16);
    this.foreColor = colorCode % 16;
  }

  // Redraws the console all in one color (equivalent to C++ stdlib system("color XX") function)
  systemColor(colorCode) {
    const { graphics, pixelSize } = this;

    [this.backColor, this.foreColor] = [...colorCode.padStart(2, '0')].map(i => parseInt(i, 16));

    graphics.fill(COLOR_VALUES[this.backColor]);
    graphics.rect(0, 0, pixelSize.width, pixelSize.height);

    graphics.tint(COLOR_VALUES[this.foreColor]);
    graphics.image(this.contentBuffer, 0, 0);
    graphics.noTint();
  }

  clear() {
    const { graphics, pixelSize } = this;
    
    graphics.fill(COLOR_VALUES[this.backColor]);
    graphics.rect(0, 0, pixelSize.width, pixelSize.height);
    
    this.contentBuffer.clear();
    this.cursor = { x: 0, y: 0 };
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

  printCharCode(code) {
    if (!Number.isInteger(code) || code < 0 || code >= 256) {
      throw new Error('Invalid ascii code: ' + code);
    }

    const { graphics, contentBuffer } = this;
    const { asciiFontMap, asciiFontColorMap, charWidth, charHeight } = Cmd;

    const dx = this.cursor.x*charWidth;
    const dy = this.cursor.y*charHeight;
    
    graphics.fill(COLOR_VALUES[this.backColor]);
    graphics.rect(dx, dy, charWidth, charHeight);

    contentBuffer.erase();
    contentBuffer.rect(dx, dy, charWidth, charHeight);
    contentBuffer.noErase();

    const cx = (this.foreColor % 4) * asciiFontMap.width;
    const cy = floor(this.foreColor / 4) * asciiFontMap.height;

    const sx = (code % 16) * (asciiFontMap.width/16);
    const sy = floor(code / 16) * (asciiFontMap.height/16);

    graphics.image(asciiFontColorMap, dx, dy, charWidth, charHeight, sx+cx, sy+cy, charWidth, charHeight);

    contentBuffer.image(asciiFontMap, dx, dy, charWidth, charHeight, sx, sy, charWidth, charHeight);

    this.advanceCursor();

    return this;
  }

  setWindowHeight(height) {
    const { t, b } = Cmd.frameParts;

    if (height === 0) {
      this.resize(undefined, DEFAULT_GRID_HEIGHT);
    } else {
      this.resize(undefined, round((height - t.height - b.height) / Cmd.charHeight));
    }
  }

  resize(width, height) {
    width ??= this.gridSize.width;
    height ??= this.gridSize.height;
    if (width !== this.gridSize.width || height !== this.gridSize.height) {
      this.gridSize = { width, height };
      this.onResized();
    }
  }

  onResized() {
    const { gridSize, pixelSize } = this;
    const { t, l, r, b } = Cmd.frameParts;

    pixelSize.width = gridSize.width * Cmd.charWidth;
    pixelSize.height = gridSize.height * Cmd.charHeight;

    this.graphics?.remove();
    this.graphics = createGraphics(pixelSize.width + l.width + r.width, pixelSize.height + t.height + b.height);
    this.graphics.clear();
    this.graphics.noStroke();

    this.contentBuffer?.remove();
    this.contentBuffer = createGraphics(pixelSize.width, pixelSize.height);
    this.contentBuffer.clear();
    this.contentBuffer.noStroke();

    this.drawFrame();

    this.drawTitle();

    this.clear();
  }

  drawFrame() {
    const { graphics } = this;
    const { tl, t, tr, l, r, bl, b, br } = Cmd.frameParts;

    graphics.resetMatrix();

    graphics.image(tl, 0, 0);
    graphics.image(t, tl.width, 0, graphics.width - tl.width - tr.width, t.height);
    graphics.image(tr, graphics.width - tr.width, 0);

    graphics.image(l, 0, tl.height, l.width, graphics.height - tl.height - bl.height);
    graphics.image(r, graphics.width - r.width, tr.height, r.width, graphics.height - tr.height - br.height);

    graphics.image(bl, 0, graphics.height - bl.height);
    graphics.image(b, bl.width, graphics.height - b.height, graphics.width - bl.width - br.width, b.height);
    graphics.image(br, graphics.width - br.width, graphics.height - br.height);

    graphics.translate(l.width, t.height);
  }

  drawTitle() {
    const { graphics, title } = this;
    const { tl, t, tr, l } = Cmd.frameParts;
    const { appIcon, systemFont } = CmdEmulator;

    graphics.resetMatrix();

    graphics.image(t, tl.width, 0, graphics.width-tl.width-tr.width, t.height);
    
    graphics.image(appIcon, l.width, t.height/2 - 7, 16, 16 / (appIcon.width/appIcon.height));

    const titleX = l.width + 24;
    const titleY = t.height/2 - 2;

    graphics.push();
    {
      graphics.noStroke();
      graphics.textFont(systemFont);
      graphics.textAlign(LEFT, CENTER);
      graphics.textSize(12);
      graphics.noFill();
      graphics.strokeWeight(8); graphics.stroke('#FFFFFF08'); graphics.text(title, titleX, titleY);
      graphics.strokeWeight(6); graphics.stroke('#FFFFFF18'); graphics.text(title, titleX, titleY);
      graphics.strokeWeight(4); graphics.stroke('#FFFFFF28'); graphics.text(title, titleX, titleY);
      graphics.strokeWeight(2); graphics.stroke('#FFFFFF38'); graphics.text(title, titleX, titleY);
      graphics.noStroke();
      graphics.fill(0); graphics.text(title, titleX, titleY);
    }
    graphics.pop();

    graphics.translate(l.width, t.height);
  }
}