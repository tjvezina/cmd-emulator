async function showVeziPlayLogo() {
	/* ---\/--- VEZI-PLAY LOGO START ---\/--- */

  await cmd.setWindowHeight(0); // make sure window is at default size

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
  logoSound.play();
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
