class Card {
  static faceName = ['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
  static suitName = ['', 'Hearts', 'Diamonds', 'Clubs', 'Spades'];

  static printCardOutline(x, y, back, table) {
    const cornerTL = 218, cornerTR = 191, cornerBL = 192, cornerBR = 217;
    const sideT = 220, sideR = 221, sideL = 222, sideB = 223;

    cmd.gotoxy(x, y);

    if (!back && !table) {
      cmd.setColor(15);
    } else if (back && !table) {
      cmd.setColor(6);
    } else if (!back && table) {
      cmd.setColor(47);
    } else {
      cmd.setColor(38);
    }

    // output border
    cmd.cout(cornerTL);
    for (let counter = 1; counter <= 11; counter++) {
      cmd.cout(sideT);
    }
    cmd.cout(cornerTR);
    cmd.gotoxy(x, ++y);
    for (let counter = 1; counter <= 10; counter++) {
      cmd.cout(toChar(sideL) + '           ' + toChar(sideR));
      cmd.gotoxy(x, ++y);
    }
    cmd.cout(cornerBL);
    for (let counter = 1; counter <= 11; counter++) {
      cmd.cout(sideB);
    }
    cmd.cout(cornerBR);
  }

  // print a face-down card at (x, y); include bool "true" for table (green) background
  static printBack(x, y, table) {
    // print the outline, position the cursor
    Card.printCardOutline(x, y, true, table);
    cmd.gotoxy(++x, ++y);

    cmd.setColor(70);

                        cmd.cout('           ');
    cmd.gotoxy(x, ++y); cmd.cout('::::.  .:::');
    cmd.gotoxy(x, ++y); cmd.cout('WVVW:  :WVW');
    cmd.gotoxy(x, ++y); cmd.cout(':WW:.  .:W:');
    cmd.gotoxy(x, ++y); cmd.cout('.:WW:..:W:.');
    cmd.gotoxy(x, ++y); cmd.cout(' .:WW::W:. ');
    cmd.gotoxy(x, ++y); cmd.cout('  .:WWW:.  ');
    cmd.gotoxy(x, ++y); cmd.cout('   .:W:.   ');
    cmd.gotoxy(x, ++y); cmd.cout(' VEZI:PLAY ');
    cmd.gotoxy(x, ++y); cmd.cout('           ');

    cmd.setColor(7);

    cmd.gotoxy(x = 1, y += 2);
  }

  static async printCardSet(cardSet, y, table) {
    let c = cardSet.length;

    if (c > 23) {
      cmd.cout('ERROR: Cannot print [' + c + '] cards (max 23)!');
      return;
    }

    // initial value of x (position the first card should be printed at)
    let x = this.get_xInit(c);
    // x increment (space between cards)
    let xInc = this.get_xInc(c);

    for (let card = 0; card < c; card++) {
      await sleep(500 / c);
      cardSet[card].printCard(x, y, table);
      x += xInc;
    }
  }

  static async printBackSet(c, y, table) {
    if (c > 23) {
      c = 23;
    }

    // initial value of x (position the first card should be printed at)
    let x = this.get_xInit(c);
    // x increment (space between cards)
    let xInc = this.get_xInc(c);

    for (let card = 0; card < c; card++) {
      await sleep(500 / c);
      this.printBack(x, y, table);
      x += xInc;
    }
  }

  static outputTable(newX, newY, w, h) {
    // 2 card wide = 32 chars, 3 cards = 45 chars
    // 1 card high = 14 chars

    const tableWidth = w, tableHeight = h;

    const cornerTL = 218, cornerTR = 191, cornerBL = 192, cornerBR = 217, filler = 219;
    const sideH = 196, sideV = 179;

    let x = newX, y = newY;
    cmd.gotoxy(x, y);
    cmd.setColor(100);

    cmd.cout(cornerTL);
    for (let counter = 1; counter <= tableWidth - 2; counter++) {
      cmd.cout(sideH);
    }
    cmd.cout(cornerTR);

    cmd.gotoxy(x, ++y);

    for (let counter = 1; counter <= tableHeight - 2; counter++) {
      cmd.cout(sideV);
      x += (tableWidth - 1);
      cmd.gotoxy(x, y);
      cmd.cout(sideV);
      x -= (tableWidth - 1);
      cmd.gotoxy(x, ++y);
    }

    cmd.cout(cornerBL);
    for (let counter = 1; counter <= tableWidth - 2; counter++) {
      cmd.cout(sideH);
    }
    cmd.cout(cornerBR);

    cmd.setColor(2);

    x = (newX + 1);
    y = (newY + 1);
    cmd.gotoxy(x, y);

    for (let row = 1; row <= tableHeight - 2; row++) {
      for (let column = 1; column <= tableWidth - 2; column++) {
        cmd.cout(filler);
      }
      cmd.gotoxy(x, ++y);
    }
  }

  static sortCards(cards, acesHigh) {
    let sorted = false;

    let holder;

    do {
      sorted = true; // if still true at end, cards are sorted

      let cardNum = cards.length;

      for (let c = 0; c < cardNum - 1; c++) {
        let face1 = cards[c].face;
        let face2 = cards[c+1].face;
        
        if (face1 === 1 && acesHigh) {
          face1 += 13;
        }
        if (face2 === 1 && acesHigh) {
          face2 += 13;
        }

        if (face1 > face2) {
          holder = cards[c];
          cards[c] = cards[c+1];
          cards[c+1] = holder;

          sorted = false;
        }
      }
    } while (sorted === false);
  }

  static get_xInit(c) {
    // xInit for 1-6 cards
    if (c <= 6) {
      if (c % 2 === 1) {
        return 34 - (((c-1)/2)*13);
      } else {
        return 27 - (((c/2)-1)*13);
      }
    } else { // xInit for 7-23 (max)
      switch (c) {
        case 9:
        case 17:
          return 1;
        case 8:
        case 10:
        case 22:
          return 2;
        case 7:
        case 11:
        case 13:
        case 16:
        case 21:
          return 3;
        case 15:
        case 20:
          return 5;
        case 12:
        case 19:
          return 6;
        case 14:
          return 7;
        case 18:
          return 8;
        case 23:
          return 0;
      }
    }
    return -1;
  }

  static get_xInc(c) {
    // set xInc
    if (c <= 6) {
      return 13;
    } else if (c === 13) {
      return 5;
    } else if (c >= 14 && c <= 17) {
      return 4;
    } else if (c >= 18) {
      return 3;
    } else { // 7 - 12 cards
      return 17 - c;
    }
  }

  suit;
  face;

  constructor(f, s) {
    this.face = f;
    this.suit = s;
  }

  getSuitName() {
    return Card.suitName[this.suit];
  }

  getFaceName() {
    return Card.faceName[this.face];
  }

  printCard(x, y, table) {
    // print the outline, position the cursor
    Card.printCardOutline(x, y, false, table);
    cmd.gotoxy(++x, ++y);

    // output the specific card
    let S = toChar(this.suit + 2);

    if (this.suit === 1 || this.suit === 2) {
      cmd.setColor(244);
    } else {
      cmd.setColor(240);
    }

    if (this.face === 10) {
      cmd.cout('10         ');
    } else {
      cmd.cout((Card.faceName[this.face])[0] + '          ');
    }

    cmd.gotoxy(x, ++y);
    cmd.cout(S + '          ');

    if (this.face === 1) {
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
    } else if (this.face === 2) {
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
    } else if (this.face === 3) {
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
    } else if (this.face === 4) {
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
    } else if (this.face === 5) {
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
    } else if (this.face === 6) {
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
    } else if (this.face === 7) {
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
    } else if (this.face === 8) {
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
    } else if (this.face === 9) {
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('           ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
    } else if (this.face === 10) {
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.cout('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.cout('   ' + S + '   ' + S + '   ');
    } else if (this.face === 11) {
      cmd.gotoxy(x, ++y); cmd.cout("     ,:,   ");
      cmd.gotoxy(x, ++y); cmd.cout("    .:" + S + ":.  ");
      cmd.gotoxy(x, ++y); cmd.cout("     ':'   ");
      cmd.gotoxy(x, ++y); cmd.cout("   ,:,     ");
      cmd.gotoxy(x, ++y); cmd.cout("  .:" + S + ":.    ");
      cmd.gotoxy(x, ++y); cmd.cout("   ':'     ");
    } else if (this.face === 12) {
      cmd.gotoxy(x, ++y); cmd.cout("    .:.    ");
      cmd.gotoxy(x, ++y); cmd.cout(" .:.:" + S + ":    ");
      cmd.gotoxy(x, ++y); cmd.cout(" :" + S + ":':'.:. ");
      cmd.gotoxy(x, ++y); cmd.cout(" ':'.:.:" + S + ": ");
      cmd.gotoxy(x, ++y); cmd.cout("    :" + S + ":':' ");
      cmd.gotoxy(x, ++y); cmd.cout("    ':'    ");
    } else if (this.face === 13) {
      cmd.gotoxy(x, ++y); cmd.cout("    ,:,    ");
      cmd.gotoxy(x, ++y); cmd.cout(" .:.:" + S + ":.:. ");
      cmd.gotoxy(x, ++y); cmd.cout(" :" + S + ":':':" + S + ": ");
      cmd.gotoxy(x, ++y); cmd.cout(" :" + S + ":.:.:" + S + ": ");
      cmd.gotoxy(x, ++y); cmd.cout(" ':':" + S + ":':' ");
      cmd.gotoxy(x, ++y); cmd.cout("    ':'    ");
    }

    cmd.gotoxy(x, ++y);
    cmd.cout('          ' + S);
    cmd.gotoxy(x, ++y);
    if (this.face === 10) {
      cmd.cout('         10');
    } else {
      cmd.cout('          ' + (Card.faceName[this.face])[0]);
    }

    cmd.gotoxy(x = 1, y += 2);

    cmd.setColor(7);
  }

  toString() {
    return (Card.faceName[this.face] + ' of ' + Card.suitName[this.suit]);
  }
}