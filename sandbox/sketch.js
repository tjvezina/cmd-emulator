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
  cmd.cout('\n  Enter text: ');
  const input = await cmd.getline();
  cmd.cout('  ' + input);

  cmd.cout('\n\n  Enter secret: ');
  const secret = await cmd.getline({ isPassword: true });
  cmd.cout('  ' + secret);

  await cmd.getch();
}

async function renderPerformanceTest() {
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
