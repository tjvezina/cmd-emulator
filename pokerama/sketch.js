let cmdEmulator;

const hold = new Array(5);

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  cmdEmulator = new CmdEmulator({ main, exeName: 'Pokerama' });
}

function draw() {
  cmdEmulator.draw();
}

async function main() {
  cmd.setConsoleTitle('Pokerama - Vezi-Play');

  await showVeziPlayLogo();

  await cmd.setWindowHeight(425);

  await playPoker();

  cmd.setColor(3);
  cmd.gotoxy(23, 29);

  return 0;
}

async function playPoker() {
  // 2 vectors to hold the player's and dealer's hands
  const pCards = [];
  const dCards = [];

  // instantiate and shuffle a new deck
  const pokerDeck = new Deck();
  pokerDeck.shuffleDeck();

  // deal 5 cards to each hand
  for (let c = 0; c < 5; c++) {
    pCards.push(pokerDeck.dealCard());
    dCards.push(pokerDeck.dealCard());
  }

  sortCards(pCards);
  sortCards(dCards);

  // draw lines to create the illusion of depth
  await showDepthLines(39, 3, 4);
  await showDepthLines(39, 1, 2);
  await showDepthLines(39, 1, 4);

  // print 5 cards for the dealer (small, face down)
  for (let c = 0; c < 5; c++) {
    await sleep(200);
    printCardBackSmall((c*10)+16, 6);
  }

  while (true) { // loop to create a new hand each time
    pokerDeck.shuffleDeck();

    // deal 5 cards to the player
    for (let c = 0; c < 5; c++) {
      pCards[c] = pokerDeck.dealCard();
    }

    sortCards(pCards);

    for (let c = 0; c < 5; c++) {
      hold[c] = false;
    }

    // print the player's cards, sorted (large, face up)
    for (let c = 0; c < 5; c++) {
      await sleep(200);
      pCards[c].printCard((c*14)+6, 10);
    }

    await getHoldCards();

    // replace cards (unless all are set to hold)
    if (!(hold[0] && hold[1] && hold[2] && hold[3] && hold[4])) {
      for (let c = 0; c < 5; c++) {
        if (!hold[c]) { // if card is not being held, deal new card
          Card.printBack((c*14)+6, 10);
          await sleep(300);
          pCards[c] = pokerDeck.dealCard();
          pCards[c].printCard((c*14)+6, 10);
          await sleep(700);
        }
      }

      sortCards(pCards);

      for (let c = 0; c < 5; c++) {
        await sleep(100);
        Card.printBack((c*14)+6, 10);
      }
      for (let c = 0; c < 5; c++) {
        await sleep(100);
        pCards[c].printCard((c*14)+6, 10);
      }
    }

    const handRank = getHandValue(pCards);

    const handRankName = ['',
      ' Royal flush!', 'Straight flush!', 'Four-of-a-kind!', ' Full house!', '    Flush',
      '  Straight', ' 3-of-a-Kind', '  Two Pair', '    Pair', ' High Card',
    ];

    cmd.gotoxy(35, 24);
    cmd.setColor(14);
    cmd.cout(handRankName[handRank]);

    if (handRank === 10) {
      cmd.gotoxy(34, 26);
      cmd.cout('(' + pCards[4].toString() + ')');
    }

    await cmd.getch();

    cmd.gotoxy(35, 24);
    cmd.cout('                ');

    if (handRank === 10) {
      cmd.gotoxy(34, 26);
      cmd.cout('                        ');
    }

    // print face-down cards before dealing the new hand
    for (let c = 0; c < 5; c++) {
      await sleep(100);
      Card.printBack((c*14)+6, 10);
    }
  }
}

async function getHoldCards() {
  let cardNum = 2;
  cmd.setColor(14);

  for (let c = 0; c < 5; c++) {
    cmd.gotoxy((c*14)+11, 23);
    cmd.cout('[ ]');
  }

  cmd.gotoxy(40, 25);
  cmd.cout(24);

  cmd.gotoxy(11, 26);
  cmd.setColor(10);
  cmd.cout('Use arrow keys and space bar to choose which cards to hold.');
  cmd.gotoxy(26, 27);
  cmd.cout('Press enter when you\'re done.');
  cmd.gotoxy(25, 29);
  await cmd.pause();
  cmd.gotoxy(11, 26);
  cmd.cout('                                                           ');
  cmd.gotoxy(24, 27);
  cmd.cout('                               ');
  cmd.gotoxy(25, 29);
  cmd.cout('                               ');

  while (true) {
    cmd.setColor(14);

    // wait for user input
    const move = await cmd.getch();

    // ->if enter key, return
    if (move === 13) {
      let holdCount = 0;
      for (let c = 0; c < 5; c++) {
        if (hold[c] === true) {
          holdCount++;
        }
      }

      if (holdCount >= 2) { // if player has selected enough cards, return
        for (let c = 0; c < 5; c++) {
          cmd.gotoxy((c*14)+11, 23);
          cmd.cout('   ');
        }
        cmd.gotoxy((cardNum*14)+12, 25);
        cmd.cout(' ');
        return;
      } else {
        cmd.gotoxy(19, 27);
        cmd.setColor(12);
        cmd.cout('You must hold at least 2 cards to continue.');
        cmd.gotoxy(25, 29);
        await cmd.pause();
        cmd.gotoxy(19, 27);
        cmd.cout('                                           ');
        cmd.gotoxy(25, 29);
        cmd.cout('                               ');
      }
    }
    // ->if space bar, mark/unmark card
    else if (move === ' ') {
      cmd.gotoxy((cardNum*14)+12, 23);

      if (hold[cardNum] === false) {
        cmd.cout(2);
        hold[cardNum] = true;
      } else {
        cmd.cout(' ');
        hold[cardNum] = false;
      }
    }
    // -> if arrow key, move cursor
    else {
      if (move === LEFT_ARROW) {
        if (cardNum > 0) {
          cmd.gotoxy((cardNum*14)+12, 25);
          cmd.cout(' ');
          cardNum--;
          cmd.gotoxy((cardNum*14)+12, 25);
          cmd.cout(24);
        }
      } else if (move === RIGHT_ARROW) {
        if (cardNum < 4) {
          cmd.gotoxy((cardNum*14)+12, 25);
          cmd.cout(' ');
          cardNum++;
          cmd.gotoxy((cardNum*14)+12, 25);
          cmd.cout(24);
        }
      }
    }
  } // end while move loop
}

function getHandValue(pokerHand) {
  // arrays for the face/suit values of the hand
  const f = new Array(5);
  const s = new Array(5);

  for (let c = 0; c < 5; c++) {
    f[c] = pokerHand[c].face;
    s[c] = pokerHand[c].suit;
  }

  // check for aces and kings (if both, aces are high)
  let numAces = 0;
  let hasKing = false;
  for (let c = 0; c < 5; c++) {
    if (f[c] === 1) {
      numAces++;
    } else if (f[c] === 13) {
      hasKing = true;
    }
  }

  if (numAces === 1 && hasKing) {
    f[4] += 13; // make ace high, in case of straight
  }

  // bools to check for pairs, strights, and matching suits
  // if card 0 and card 1 are a pair, p[0] = true
  // if card 1 and card 2 are a pair, p[1] = true
  // !!!cards are assumed to be sorted!!!
  let pair = [false, false, false, false];
  let strt = [false, false, false, false];
  let suit = [false, false, false, false];

  for (let c = 0; c < 4; c++) {
    let face1 = pokerHand[c].face;
    let face2 = pokerHand[c+1].face;
    let suit1 = pokerHand[c].suit;
    let suit2 = pokerHand[c+1].suit;

    if (face1 === face2) { // if same face value, pair
      pair[c] = true;
    } else if (face1 === face2 - 1) { // if ordered face values, straight
      strt[c] = true;
    }

    if (suit1 === suit2) {
      suit[c] = true;
    }
  }

  let straight = false, sameSuits = false;

  if (strt[0] && strt[1] && strt[2] && strt[3]) { // complete straight
    straight = true;
  }
  if (suit[0] && suit[1] && suit[2] && suit[3]) {
    sameSuits = true;
  }

  if (straight) { // complete straight
    if (sameSuits) { // all same suit
      if (hasKing && numAces === 1) {
        return 1; // royal flush
      } else {
        return 2; // straight flush
      }
    } else {
      return 6; // stright
    }
  } else if (sameSuits) {
    return 5; // flush
  } else if ((pair[0] && pair[1] && pair[2]) || (pair[1] && pair[2] && pair[3])) {
    return 3; // 4-of-a-kind
  } else if ((pair[0] && pair[1] && pair[3]) || (pair[0] && pair[2] && pair[3])) {
    return 4; // full house (3-of-a-kind + pair)
  } else if ((pair[0] && pair[1]) || (pair[1] && pair[2]) || (pair[2] && pair[3])) {
    return 7; // 3-of-a-kind
  } else if ((pair[0] && pair[2]) || (pair[0] && pair[3]) || (pair[1] && pair[3])) {
    return 8; // 2 pair
  } else if (pair[0] || pair[1] || pair[2] || pair[3]) {
    return 9; // pair
  } else {
    return 10; // high card
  }
}

async function showDepthLines(lines, n, d) {
  // lines = total lines at 1:1 slope
  // n = numerator, d = denominator
  // (i.e. n = 3, d = 4 -> 3/4 slope for the line)
  cmd.setColor(1);
  for (let c = lines; c > 0; c--) {
    if (c === floor(lines * 4/5)) {
      cmd.setColor(3);
    } else if (c === floor(lines * 2/5)) {
      cmd.setColor(11);
    }

    cmd.gotoxy(c, floor((lines-c)*n/d));
    cmd.cout('o');
    cmd.gotoxy(80 - c, floor((lines-c)*n/d));
    cmd.cout('o');

    await sleep(10);
  }
}

function printCardBackSmall(x, y) {
  let cTL = toChar(218), cTR = toChar(191), cBL = toChar(192), cBR = toChar(217);
  let wT = toChar(220), wL = toChar(222), wR = toChar(221), wB = toChar(223);

  cmd.setColor(6); // border

  cmd.gotoxy(x,   y); cmd.cout(cTL + wT + wT + wT + wT + wT + wT + wT + cTR);
  cmd.gotoxy(x, ++y); cmd.cout(wL + '       ' + wR);
  cmd.gotoxy(x, ++y); cmd.cout(wL + '       ' + wR);
  cmd.gotoxy(x, ++y); cmd.cout(wL + '       ' + wR);
  cmd.gotoxy(x, ++y); cmd.cout(wL + '       ' + wR);
  cmd.gotoxy(x, ++y); cmd.cout(wL + '       ' + wR);
  cmd.gotoxy(x, ++y); cmd.cout(wL + '       ' + wR);
  cmd.gotoxy(x, ++y); cmd.cout(wL + '       ' + wR);
  cmd.gotoxy(x, ++y); cmd.cout(cBL + wB + wB + wB + wB + wB + wB + wB + cBR);

  cmd.setColor(70); // filler

  cmd.gotoxy(++x, y -= 7); cmd.cout('.     .');
  cmd.gotoxy(x, ++y);      cmd.cout('W:. .:W');
  cmd.gotoxy(x, ++y);      cmd.cout(':W:.:W:');
  cmd.gotoxy(x, ++y);      cmd.cout(' :W:W: ');
  cmd.gotoxy(x, ++y);      cmd.cout('  :W:  ');
  cmd.gotoxy(x, ++y);      cmd.cout('VEZI   ');
  cmd.gotoxy(x, ++y);      cmd.cout('   PLAY');
}

function sortCards(cards) {
  let sorted = false;

  let holder;

  do {
    sorted = true; // if still true at end, cards are sorted

    let cardNum = cards.length;

    for (let c = 0; c < (cardNum - 1); c++) {
      if (cards[c].face > cards[c+1].face) {
        holder = cards[c];
        cards[c] = cards[c+1];
        cards[c+1] = holder;

        sorted = false;
      }
    }
  } while (!sorted);

  // check for aces and kings
  let numAces = 0;
  let hasKing = false;

  for (let c = 0; c < cards.length; c++) {
    if (cards[c].face === 1) {
      numAces++;
    } else if (cards[c].face === 13) {
      hasKing = true;
    }
  }

  // if player has an ace and a king, make the ace high (put it at the end of the hand)
  if (numAces === 1 && hasKing) {
    holder = cards[0];

    for (let c = 0; c < 4; c++) {
      cards[c] = cards[c+1];
    }

    cards[4] = holder;
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
  await sleep(400);
  const veziPlayTitle = 'VEZI-PLAY';
  for (let c = 0; c < veziPlayTitle.length; c++) {
    await sleep(100);
    cmd.cout(veziPlayTitle[c] + '   ');
  }
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
