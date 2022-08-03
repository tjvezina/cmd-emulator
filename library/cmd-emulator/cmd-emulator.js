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
const ColorValues = [
  '#000000', '#000080', '#008000', '#008080', '#800000', '#800080', '#808000', '#C0C0C0',
  '#808080', '#0000FF', '#00FF00', '#00FFFF', '#FF0000', '#FF00FF', '#FFFF00', '#FFFFFF',
];

const cmdAssetPath = '../library/cmd-emulator/assets';

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
    loadImage(`${cmdAssetPath}/desktop-background.png`, result => this.desktopBackground = result);
    loadImage(`${cmdAssetPath}/app-icon.png`, result => this.appIcon = result);
    
    loadFont(`${cmdAssetPath}/Segoe UI.ttf`, result => this.systemFont = result);
  }

  main;
  title = 'Command Prompt Emulator';
  exeName;

  wasDoubleClicked = false;

  constructor({ main, title, exeName }) {
    this.main = main;
    this.title = (title ?? this.title);
    this.exeName = (exeName ?? this.title) + '.exe';

    wrapP5Events(this, 'doubleClicked', 'keyPressed');
  }

  draw() {
    const { appIcon, systemFont } = CmdEmulator;
    const { exeName } = this;

    clear();
    this.#drawBackground();

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
      this.#execute();
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

  #drawBackground() {
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

  async #execute() {
    cmd = new Cmd(this.title);

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
    loadImage(`${cmdAssetPath}/ascii-font.png`, result => {
      this.asciiFontMap = result;
      this.charWidth = this.asciiFontMap.width/16;
      this.charHeight = this.asciiFontMap.height/16;
    });

    const framePartNames = ['tl', 't', 'tr', 'l', 'r', 'bl', 'b', 'br'];
    framePartNames.forEach(partName => {
      loadImage(`${cmdAssetPath}/cmd-frame-${partName}.png`, result => {
        this.frameParts[partName] = result;
      });
    });
  }

  static setup() {
    const { asciiFontMap } = this;

    // tint() performance is so bad, it's better to save each color individually
    this.asciiFontColorMap = createGraphics(asciiFontMap.width*4, asciiFontMap.height*4);
    ColorValues.forEach((col, i) => {
      const x = (i % 4) * asciiFontMap.width;
      const y = floor(i / 4) * asciiFontMap.height;
      this.asciiFontColorMap.tint(col);
      this.asciiFontColorMap.image(asciiFontMap, x, y);
    });
  }

  title;

  gridSize = { width: 80, height: 25 };
  pixelSize = { width: 0, height: 0 };

  cursor = { x: 0, y: 0 };

  // Main p5.Graphics object for drawing the CMD window and content
  graphics;
  // Mirrors the current foreground content in white for quick redraw in a new color (see `systemColor()`)
  contentBuffer;

  foreColor = Color.Gray;
  backColor = Color.Black;

  wasKeyPressed = false;

  constructor(title) {
    this.title = title;

    this.#onResize();
  }

  remove() {
    this.graphics?.remove();
    this.contentBuffer?.remove();
  }

  draw() {
    const { graphics } = this;
    image(graphics, round((width - graphics.width) / 2), round((height - graphics.height) / 2));
  }

  resize(width, height) {
    if (width !== this.gridSize.width || height !== this.gridSize.height) {
      this.gridSize = { width, height };
      this.#onResize();
    }
  }

  gotoxy(x, y) {
    this.cursor = {
      x: constrain(x, 0, this.gridSize.width-1),
      y: constrain(y, 0, this.gridSize.height-1),
    };
  }

  setColor(colorCode) {
    this.backColor = floor(colorCode / 16);
    this.foreColor = colorCode % 16;
  }

  write(msg) {
    [...(msg ?? '')].forEach(c => this.writeCode(c.charCodeAt(0)));
  }

  writeLine(msg) {
    this.write(msg);
    this.#newline();
  }

  // Redraws the console all in one color (equivalent to C++ stdlib system("color XX") function)
  systemColor(colorCode) {
    [this.backColor, this.foreColor] = [...colorCode.padStart(2, '0')].map(i => parseInt(i, 16));

    const { graphics } = this;

    this.clear({ clearBuffer: false });

    graphics.tint(ColorValues[this.foreColor]);
    graphics.image(this.contentBuffer, 0, 0);
    graphics.noTint();
  }

  writeCode(code) {
    if (isNaN(Number(code) || code < 0 || code >= 256)) throw new Error('Invalid ascii code ' + code)

    const { graphics, contentBuffer } = this;
    const { asciiFontMap, asciiFontColorMap, charWidth, charHeight } = Cmd;

    const dx = this.cursor.x*charWidth;
    const dy = this.cursor.y*charHeight;
    
    graphics.fill(ColorValues[this.backColor]);
    graphics.rect(dx, dy, charWidth, charHeight);

    // Skip font rendering for empty characters
    if (![0, 32].includes(code)) {
      const cx = (this.foreColor % 4) * asciiFontMap.width;
      const cy = floor(this.foreColor / 4) * asciiFontMap.height;
  
      const sx = (code % 16) * (asciiFontMap.width/16);
      const sy = floor(code / 16) * (asciiFontMap.height/16);

      graphics.image(asciiFontColorMap, dx, dy, charWidth, charHeight, sx+cx, sy+cy, charWidth, charHeight);

      contentBuffer.image(asciiFontMap, dx, dy, charWidth, charHeight, sx, sy, charWidth, charHeight);
    }

    this.#advanceCursor();
  }

  clear({ clearBuffer = true } = {}) {
    const { graphics, pixelSize } = this;

    if (clearBuffer === true) {
      this.contentBuffer.clear();
      this.cursor = { x: 0, y: 0 };
    }

    graphics.fill(ColorValues[this.backColor]);
    graphics.rect(0, 0, pixelSize.width, pixelSize.height);
  }

  async getChar() {
    this.wasKeyPressed = false;
    do {
      await sleep(0);
    } while (!this.wasKeyPressed);
    this.wasKeyPressed = false;

    return keyCode;
  }

  // Writes a message and waits for user input to continue
  async pause() {
    this.write('Press any key to continue . . . ');
    await this.getChar();
  }

  keyPressed() {
    this.wasKeyPressed = true;
  }

  #advanceCursor() {
    if (++this.cursor.x >= this.gridSize.width) {
      this.#newline();
    }
  }

  #newline() {
    this.cursor.x = 0;
    this.cursor.y = min(this.cursor.y + 1, this.gridSize.height - 1);
  }

  #onResize() {
    const { gridSize, pixelSize } = this;
    const { tl, t, tr, l, r, bl, b, br } = Cmd.frameParts;

    pixelSize.width = gridSize.width * Cmd.charWidth;
    pixelSize.height = gridSize.height * Cmd.charHeight;

    const cmdWidth = pixelSize.width + l.width + r.width;
    const cmdHeight = pixelSize.height + t.height + b.height;

    this.graphics?.remove();
    this.graphics = createGraphics(cmdWidth, cmdHeight);

    this.contentBuffer?.remove();
    this.contentBuffer = createGraphics(this.pixelSize.width, this.pixelSize.height);
    this.contentBuffer.clear();

    const { graphics } = this;
    const { appIcon, systemFont } = CmdEmulator;

    graphics.clear();

    graphics.image(tl, 0, 0);
    graphics.image(t, tl.width, 0, cmdWidth-tl.width-tr.width, t.height);
    graphics.image(tr, cmdWidth-tr.width, 0);

    graphics.image(l, 0, tl.height, l.width, cmdHeight-tl.height-bl.height);
    graphics.image(r, cmdWidth-r.width, tr.height, r.width, cmdHeight-tr.height-br.height);

    graphics.image(bl, 0, cmdHeight-bl.height);
    graphics.image(b, bl.width, cmdHeight-b.height, cmdWidth-bl.width-br.width, b.height);
    graphics.image(br, cmdWidth-br.width, cmdHeight-br.height);

    graphics.image(appIcon, l.width, t.height/2 - 7, 16, 16 / (appIcon.width/appIcon.height));

    const titleX = l.width + 24;
    const titleY = t.height/2 - 2;

    graphics.noStroke();
    graphics.textFont(systemFont);
    graphics.textAlign(LEFT, CENTER);
    graphics.textSize(12);
    graphics.noFill();
    graphics.strokeWeight(8); graphics.stroke('#FFFFFF08'); graphics.text(this.title, titleX, titleY);
    graphics.strokeWeight(6); graphics.stroke('#FFFFFF18'); graphics.text(this.title, titleX, titleY);
    graphics.strokeWeight(4); graphics.stroke('#FFFFFF28'); graphics.text(this.title, titleX, titleY);
    graphics.strokeWeight(2); graphics.stroke('#FFFFFF38'); graphics.text(this.title, titleX, titleY);
    graphics.noStroke();
    graphics.fill(0); graphics.text(this.title, titleX, titleY);

    graphics.translate(l.width, t.height);

    this.foreColor = Color.Gray;
    this.backColor = Color.Black;
    this.clear();
  }
}