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
    cmd.writeChar(cornerTL);
    for (let counter = 1; counter <= 11; counter++) {
      cmd.writeChar(sideT);
    }
    cmd.writeChar(cornerTR);
    cmd.gotoxy(x, ++y);
    for (let counter = 1; counter <= 10; counter++) {
      cmd.write(toChar(sideL) + '           ' + toChar(sideR));
      cmd.gotoxy(x, ++y);
    }
    cmd.writeChar(cornerBL);
    for (let counter = 1; counter <= 11; counter++) {
      cmd.writeChar(sideB);
    }
    cmd.writeChar(cornerBR);
  }

  // print a face-down card at (x, y); include bool "true" for table (green) background
  static printBack(x, y, table) {
    // print the outline, position the cursor
    Card.printCardOutline(x, y, true, table);
    cmd.gotoxy(++x, ++y);

    cmd.setColor(70);

                        cmd.write('           ');
    cmd.gotoxy(x, ++y); cmd.write('::::.  .:::');
    cmd.gotoxy(x, ++y); cmd.write('WVVW:  :WVW');
    cmd.gotoxy(x, ++y); cmd.write(':WW:.  .:W:');
    cmd.gotoxy(x, ++y); cmd.write('.:WW:..:W:.');
    cmd.gotoxy(x, ++y); cmd.write(' .:WW::W:. ');
    cmd.gotoxy(x, ++y); cmd.write('  .:WWW:.  ');
    cmd.gotoxy(x, ++y); cmd.write('   .:W:.   ');
    cmd.gotoxy(x, ++y); cmd.write(' VEZI:PLAY ');
    cmd.gotoxy(x, ++y); cmd.write('           ');

    cmd.setColor(7);

    cmd.gotoxy(x = 1, y += 2);
  }

  static outputTable(newX, newY, w, h) {
    // 2 card wide = 32 chars, 3 cards = 45 chars

    const tableWidth = w, tableHeight = h;

    const cornerTL = 218, cornerTR = 191, cornerBL = 192, cornerBR = 217, filler = 219;
    const sideH = 196, sideV = 179;

    let x = newX, y = newY;
    cmd.gotoxy(x, y);
    cmd.setColor(100);

    cmd.writeChar(cornerTL);
    for (let counter = 1; counter <= tableWidth - 2; counter++) {
      cmd.writeChar(sideH);
    }
    cmd.writeChar(cornerTR);

    cmd.gotoxy(x, ++y);

    for (let counter = 1; counter <= tableHeight - 2; counter++) {
      cmd.writeChar(sideV);
      x += (tableWidth - 1);
      cmd.gotoxy(x, y);
      cmd.writeChar(sideV);
      x -= (tableWidth - 1);
      cmd.gotoxy(x, ++y);
    }

    cmd.writeChar(cornerBL);
    for (let counter = 1; counter <= tableWidth - 2; counter++) {
      cmd.writeChar(sideH);
    }
    cmd.writeChar(cornerBR);

    cmd.setColor(2);

    x = (newX + 1);
    y = (newY + 1);
    cmd.gotoxy(x, y);

    for (let row = 1; row < tableHeight - 2; row++) {
      for (let column = 1; column <= tableWidth - 2; column++) {
        cmd.writeChar(filler);
      }
      cmd.gotoxy(x, ++y);
    }
  }

  suit;
  face;

  constructor(f, s) {
    this.face = f;
    this.suit = s;
  }

  // print a card object at (x, y); include bool "true" for table (green) background
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
      cmd.write('10         ');
    } else {
      cmd.write((Card.faceName[this.face])[0] + '          ');
    }

    cmd.gotoxy(x, ++y);
    cmd.write(S + '          ');

    if (this.face === 1) {
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
    } else if (this.face === 2) {
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
    } else if (this.face === 3) {
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
    } else if (this.face === 4) {
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
    } else if (this.face === 5) {
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
    } else if (this.face === 6) {
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
    } else if (this.face === 7) {
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
    } else if (this.face === 8) {
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
    } else if (this.face === 9) {
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('           ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
    } else if (this.face === 10) {
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
      cmd.gotoxy(x, ++y); cmd.write('     ' + S + '     ');
      cmd.gotoxy(x, ++y); cmd.write('   ' + S + '   ' + S + '   ');
    } else if (this.face === 11) {
      cmd.gotoxy(x, ++y); cmd.write("     ,:,   ");
      cmd.gotoxy(x, ++y); cmd.write("    .:" + S + ":.  ");
      cmd.gotoxy(x, ++y); cmd.write("     ':'   ");
      cmd.gotoxy(x, ++y); cmd.write("   ,:,     ");
      cmd.gotoxy(x, ++y); cmd.write("  .:" + S + ":.    ");
      cmd.gotoxy(x, ++y); cmd.write("   ':'     ");
    } else if (this.face === 12) {
      cmd.gotoxy(x, ++y); cmd.write("    .:.    ");
      cmd.gotoxy(x, ++y); cmd.write(" .:.:" + S + ":    ");
      cmd.gotoxy(x, ++y); cmd.write(" :" + S + ":':'.:. ");
      cmd.gotoxy(x, ++y); cmd.write(" ':'.:.:" + S + ": ");
      cmd.gotoxy(x, ++y); cmd.write("    :" + S + ":':' ");
      cmd.gotoxy(x, ++y); cmd.write("    ':'    ");
    } else if (this.face === 13) {
      cmd.gotoxy(x, ++y); cmd.write("    ,:,    ");
      cmd.gotoxy(x, ++y); cmd.write(" .:.:" + S + ":.:. ");
      cmd.gotoxy(x, ++y); cmd.write(" :" + S + ":':':" + S + ": ");
      cmd.gotoxy(x, ++y); cmd.write(" :" + S + ":.:.:" + S + ": ");
      cmd.gotoxy(x, ++y); cmd.write(" ':':" + S + ":':' ");
      cmd.gotoxy(x, ++y); cmd.write("    ':'    ");
    }

    cmd.gotoxy(x, ++y);
    cmd.write('          ' + S);
    cmd.gotoxy(x, ++y);
    if (this.face === 10) {
      cmd.write('         10');
    } else {
      cmd.write('          ' + (Card.faceName[this.face])[0]);
    }

    cmd.gotoxy(x = 1, y += 2);

    cmd.setColor(7);
  }

  toString() {
    return (Card.faceName[this.face] + ' of ' + Card.suitName[this.suit]);
  }
}