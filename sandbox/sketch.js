let cmdEmulator;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  cmdEmulator = new CmdEmulator({ main: inputTest, title: 'sandbox' });
}

function draw() {
  cmdEmulator.draw();
}

async function inputTest() {
  cmd.setColor(0xE);
  cmd.cout('\n  Enter text: ');
  cmd.setColor(0x7);
  const input = await cmd.getline();
  cmd.cout('  ');
  cmd.setColor(0x8F);
  cmd.cout(input);

  cmd.setColor(0xE);
  cmd.cout('\n\n  Enter secret: ');
  cmd.setColor(0x7);
  const secret = await cmd.getline({ isPassword: true });
  cmd.cout('  ');
  cmd.setColor(0x8F);
  cmd.cout(secret);

  cmd.setColor(0xE);
  cmd.cout('\n\n  Enter integer: ');
  cmd.setColor(0x7);
  const num = await cmd.getline({ include: /[0-9]/ })
  cmd.cout('  ');
  cmd.setColor(0x8F);
  cmd.cout(num)

  cmd.setColor(0xE);
  cmd.cout('\n\n  Enter more text (no symbols): ');
  cmd.setColor(0x7);
  const text = await cmd.getline({ exclude: /[!@#$%^&*]/ });
  cmd.cout('  ');
  cmd.setColor(0x8F);
  cmd.cout(text);

  await cmd.getch();

  cmd.systemColor('E0');
  await cmd.getch();

  cmd.setColor(80);
  await cmd.setWindowHeight(425);
  await cmd.getch();

  cmd.setConsoleTitle('Some fancy title!');
  await cmd.getch();

  cmd.systemColor('B2');
  await cmd.getch();
  
  cmd.gotoxy(2, cmd.gridSize.height - 2);
  cmd.cout('Some more text!');
  await cmd.getch();

  await cmd.setWindowHeight(0);
  await cmd.getch();

  cmd.systemColor('A3');
  await cmd.getch();
}

async function resizeTest() {
  for (let i = 0; i < 30; i++) {
    await cmd.resize(random(50, 90), random(20, 60));

    cmd.gotoxy(0, 0);
    for (let i = 0; i < cmd.gridSize.width*cmd.gridSize.height; i++) {
      cmd.cout(floor(random(256)));
    }

    await sleep(500);
  }
}

async function renderPerformanceTest() {
  await cmd.resize(81, 54);

  let counts = [];

  let iter = 0;
  do {
    counts[iter] = 0;
    const start = millis();
    while (millis() - start < 1000/60) {
      cmd.foreColor = 1 + floor(random(15));
      cmd.cout(floor(random(256)));
      counts[iter]++;
    }
    await sleep(0);
    cmd.clear();
  } while (++iter < 600);

  console.log('Average writes per frame (60 FPS): ' + nf(counts.reduce((a, b) => a + b) / counts.length, 0, 2));

  return 0;
}
