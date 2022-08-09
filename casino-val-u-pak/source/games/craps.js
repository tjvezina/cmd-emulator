class Craps {
  static interfaceWidth = 78;
  static interfaceHeight = 23;

  xCoord;
  yCoord;

  die1 = 6;
  die2 = 6;

  wins = 0;
  losses = 0;

  bank;
  bankMax;
  wager = -1;

  crapsInterface = new Array(Craps.interfaceHeight).fill().map(_ => new Array(Craps.interfaceWidth));

  async play(bank) {
    this.bank = bank;
    this.bankMax = bank;

    cmd.setConsoleTitle('Craps 2.0 - Casino Val-U-Pak - Vezi-Play');

    cmd.setWindowHeight(0);

    // initialize the UI for craps
    for (let row = 0; row < Craps.interfaceHeight; row++) {
      for (let column = 0; column < Craps.interfaceWidth; column++) {
        this.crapsInterface[row][column] = ' ';
      }
    }

    for (let counter = 0; counter < Craps.interfaceWidth; counter++) {
      this.crapsInterface[0][counter] = 3 + counter % 4;
    }

    for (let counter = 1; counter < Craps.interfaceHeight - 1; counter++) {
      this.crapsInterface[counter][0] = 3 + counter % 4;
      this.crapsInterface[counter][Craps.interfaceWidth - 1] = 3 + counter % 4;
    }

    for (let counter = 0; counter < Craps.interfaceWidth; counter++) {
      this.crapsInterface[Craps.interfaceHeight - 1][counter] = 3 + counter % 4;
    }

    this.outputInterface(); // output the interface for the first time

    let result = 0, stop = 0, play = 0;

    cmd.centerString(4, `Welcome to craps, ${playerName}!`);

    cmd.gotoxy(this.xCoord = 5, this.yCoord = 7);
    cmd.cout('Winning roll: 7 or 11          Losing roll: 2, 3, 12');
    cmd.gotoxy(this.xCoord, this.yCoord += 2);
    cmd.cout('If you roll a 4, 5, 6, 8, 9 or 10 it becomes your POINT!');
    cmd.gotoxy(this.xCoord, ++this.yCoord);
    cmd.cout('Roll your POINT again to win, but if you roll a 7 first, you lose!');

    cmd.gotoxy(this.xCoord, this.yCoord += 2);
    cmd.cout('Your current balance is ');
    cmd.setColor(10);
    cmd.cout(`$${this.bank}`);
    cmd.setColor(15);
    cmd.cout(', shown in the bottom right.');
    cmd.gotoxy(this.xCoord, ++this.yCoord);
    cmd.cout('Enter a wager of "0" to quit while you\'re ahead!');

    cmd.gotoxy(this.xCoord, this.yCoord += 2);
    await cmd.pause();

    // craps game loop (continues until bank = $0)
    while (stop === 0) {
      this.wager = -1;
      this.resetAll(); // refresh the screen each loop
      cmd.gotoxy(5, 4);
      cmd.cout('Please enter a wager:');

      cmd.setColor(10);

      cmd.cout(' $');
      this.wager = Number(await cmd.getline({ include: /[0-9]/ }));

      cmd.setColor(15);

      while (this.wager > this.bank || this.wager < 0) {
        this.resetAll(); // refresh the screen each time the user enters an invalid wager
        cmd.gotoxy(5, 4);
        cmd.cout(' Enter a VALID wager:');

        cmd.setColor(10);

        cmd.cout(' $');
        this.wager = Number(await cmd.getline({ include: /[0-9]/ }));

        cmd.setColor(15);
      }

      this.showBank(); // update wager as soon as it's received (and valid)

      if (this.wager === 0) {
        break;
      }

      play = 1; // player went through at least 1 round

      cmd.endl();
      result = await this.craps();

      cmd.setColor(15);

      // for every win, "wager" is added to the bank
      if (result === 1) {
        this.bank += this.wager;
        this.wins++;

        // tracks the highest value earned during play
        if (this.bank > this.bankMax) {
          this.bankMax = this.bank;
        }
      }
      // for every loss, "wager" is subtracted from the bank
      else if (result === 0) {
        this.bank -= this.wager;
        this.losses++;
      }

      // after each turn, test to see if player is out of money
      if (this.bank === 0) {
        cmd.clear();

        this.outputInterface();

        cmd.gotoxy(this.xCoord = 9, this.yCoord = 9);

        cmd.cout('You have no money left!');

        cmd.gotoxy(this.xCoord, this.yCoord += 2);

        cmd.cout(`Too bad you didn\'t quit while you had $${this.bankMax}.\n`);

        cmd.gotoxy(this.xCoord, this.yCoord += 2);

        await cmd.pause();

        stop = 1; // bool stop ends program loop
      }
    }

    // if the player quits before going bankrupt, display a custom message
    if (this.wager === 0) {
      cmd.clear();

      this.outputInterface();

      cmd.gotoxy(this.xCoord = 9, this.yCoord = 7);

      cmd.setColor(14);
      cmd.cout('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      cmd.setColor(10);

      cmd.gotoxy(this.xCoord, this.yCoord += 2);

      cmd.cout(`                      WINNINGS: $${this.bank}`);

      cmd.gotoxy(this.xCoord, this.yCoord += 2);

      if (play === 0) {
        cmd.cout('             You didn\'t even play! What was that?');
      } else if (this.bank === bank) {
        cmd.cout('So you broke even. Good enough, if you\'re too scared to go on.');
      } else if (this.bank > (bank/10) && this.bank < bank) {
        cmd.cout('Well at least you tried. That sucked, but at least you tried.');
      } else if (this.bank <= (bank/10)) {
        cmd.cout('HAHAHAHA, wow you\'re good! Don\'t spend it all in one place!');
      } else if (this.bank > bank && this.bank < (bank*10)) {
        cmd.cout('        Hey, not bad, you made some money from that one.');
      } else if (this.bank >= (bank*10) && this.bank < (bank*100)) {
        cmd.cout('             Man, you know how to place your bets.');
      } else if (this.bank >= (bank*100)) {
        cmd.cout('                           LOLWUT');
      }

      cmd.gotoxy(this.xCoord, this.yCoord += 4);

      cmd.setColor(14);
      cmd.cout('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
      cmd.setColor(10);

      cmd.gotoxy(this.xCoord, this.yCoord -= 2);

      cmd.cout('               ');
      await cmd.pause();
    }

    return this.bank;
  }

  async craps() {
    const CONTINUE = 0;
    const WON = 1;
    const LOST = 2;

    let gameStatus;

    let myPoint = 0;

    // starting position for roll summary output
    let xCraps = 8, yCraps = 7;

    // first roll
    let sumOfDice = await this.rollDice();

    // show first roll
    cmd.gotoxy(xCraps, yCraps);
    cmd.cout(`First roll: ${sumOfDice}`);

    switch (sumOfDice) {
      case 7:
      case 11:
        gameStatus = WON;
        break;
      case 2:
      case 3:
      case 12:
        gameStatus = LOST;
        break;
      default:
        gameStatus = CONTINUE;
        myPoint = sumOfDice;

        cmd.gotoxy(xCraps, ++yCraps);
        cmd.setColor(14);
        cmd.cout(` POINT: ${myPoint}`);
        cmd.setColor(15);
        await sleep(200);
        break;
    }

    // if first roll was not 2, 3, 7, 11 or 12, keep rolling
    while (gameStatus === CONTINUE) {
      await cmd.getch();
      sumOfDice = await this.rollDice();

      // display each roll
      if (yCraps < 20) {
        cmd.gotoxy(xCraps, ++yCraps);
      } else {
        // blank all current rolls and start at the top again
        for (let row = 9; row <= 20; row++) {
          cmd.gotoxy(xCraps, row);
          cmd.cout('          ');
        }
        cmd.gotoxy(xCraps, yCraps = 9);
      }
      cmd.cout(`Rolled: ${sumOfDice}`);

      if (sumOfDice === myPoint) {
        gameStatus = WON;
      } else if (sumOfDice === 7) {
        gameStatus = LOST;
      }
    }

    if (gameStatus === WON) {
      cmd.setColor(10);
      cmd.gotoxy(xCraps, ++yCraps);
      cmd.cout('You won the round!');
      cmd.gotoxy(xCraps, ++yCraps);
      await cmd.pause();
      return 1;
    } else {
      cmd.setColor(12);
      cmd.gotoxy(xCraps, ++yCraps);
      cmd.cout('You lost the round.');
      cmd.gotoxy(xCraps, ++yCraps);
      await cmd.pause();
      return 0;
    }
  }

  async rollDice() {
    diceShaker.play();

    // outputs random dice rolls to simulate dice rolling
    for (let randomDice = 0; randomDice < 10; randomDice++) {
      this.die1 = 1 + floor(random(6));
      this.die2 = 1 + floor(random(6));
      this.showDice();
      await sleep(100);
    }

    await sleep(1000);

    return this.die1 + this.die2;
  }

  showDice() {
    // clear the dice and total
    for (let rows = 0; rows < 3; rows++) {
      cmd.gotoxy(56, 9 + rows);
      cmd.cout('     ');
      cmd.gotoxy(68, 9 + rows);
      cmd.cout('     ');
      cmd.gotoxy(67, 13);
      cmd.cout('  ');
    }

    const dot = 2;

    cmd.gotoxy(55, 7);
    cmd.cout('Roll: ' + this.die1 + '     Roll: ' + this.die2);

    cmd.gotoxy(60, 13);
    cmd.cout('Total: ' + (this.die1 + this.die2));

    cmd.setColor(11);

    // display die1
    if (this.die1 % 2 === 1) {
      cmd.gotoxy(58, 10);
      cmd.cout(dot);
    }
    if (this.die1 > 1) {
      cmd.gotoxy(56, 11);
      cmd.cout(dot);
      cmd.gotoxy(60, 9);
      cmd.cout(dot);
    }
    if (this.die1 > 3) {
      cmd.gotoxy(56, 9);
      cmd.cout(dot);
      cmd.gotoxy(60, 11);
      cmd.cout(dot);
    }
    if (this.die1 === 6) {
      cmd.gotoxy(56, 10);
      cmd.cout(dot);
      cmd.gotoxy(60, 10);
      cmd.cout(dot);
    }

    cmd.setColor(13);

    // display die2
    if (this.die2 % 2 === 1) {
      cmd.gotoxy(70, 10);
      cmd.cout(dot);
    }
    if (this.die2 > 1) {
      cmd.gotoxy(68, 11);
      cmd.cout(dot);
      cmd.gotoxy(72, 9);
      cmd.cout(dot);
    }
    if (this.die2 > 3) {
      cmd.gotoxy(68, 9);
      cmd.cout(dot);
      cmd.gotoxy(72, 11);
      cmd.cout(dot);
    }
    if (this.die2 === 6) {
      cmd.gotoxy(68, 10);
      cmd.cout(dot);
      cmd.gotoxy(72, 10);
      cmd.cout(dot);
    }

    cmd.setColor(15);
  }

  showDiceTemplate() {
    const cornerTL = 218, cornerTR = 191, cornerBL = 192, cornerBR = 217;
    const sideV = 179, sideH = 196;

    cmd.setColor(7);

    // output the edges for the die
    for (let diePlace = 0; diePlace < 13; diePlace += 12) {
      cmd.gotoxy(this.xCoord = 55 + diePlace, this.yCoord = 8);
      cmd.cout(cornerTL);
      for (let top = 0; top < 5; top++) {
        cmd.cout(sideH);
      }
      cmd.cout(cornerTR);
      
      for (let sides = 0; sides < 3; sides++) {
        cmd.gotoxy(this.xCoord, ++this.yCoord);
        cmd.cout(sideV).cout('     ').cout(sideV);
      }

      cmd.gotoxy(this.xCoord, ++this.yCoord);
      cmd.cout(cornerBL);
      for (let bottom = 0; bottom < 5; bottom++) {
        cmd.cout(sideH);
      }
      cmd.cout(cornerBR);
    }

    cmd.setColor(15);
  }

  outputInterface() {
    cmd.gotoxy(this.xCoord = 1, this.yCoord = 1);

    cmd.setColor(12);

    for (let row = 0; row < Craps.interfaceHeight; row++) {
      for (let column = 0; column < Craps.interfaceWidth; column++) {
        cmd.cout(this.crapsInterface[row][column]);
      }
      this.yCoord++;
      cmd.gotoxy(this.xCoord, this.yCoord);
    }

    this.showBank();
  }

  showBank() {
    cmd.setColor(14);
    cmd.gotoxy(this.xCoord = 59, this.yCoord = 16);
    cmd.cout('  Wins: ');
    cmd.setColor(15);
    cmd.cout(`${this.wins}`);

    cmd.setColor(14);
    cmd.gotoxy(this.xCoord, ++this.yCoord);
    cmd.cout('Losses: ');
    cmd.setColor(12);
    cmd.cout(`${this.losses}`);

    cmd.setColor(14);
    cmd.gotoxy((this.xCoord - playerName.length - 1), this.yCoord += 2);
    cmd.cout(`${playerName}'s Bank: `);
    cmd.setColor(10);
    cmd.cout(`$${this.bank}`);

    cmd.setColor(14);
    cmd.gotoxy(this.xCoord, ++this.yCoord);
    cmd.cout(' Wager: ');
    cmd.setColor(10);

    // prevents initial value of wager from showing as "$-1"
    if (this.wager < 0) {
      cmd.cout('$0');
    } else if (this.wager < this.bank && this.wager > 0) {
      cmd.cout(`$${this.wager}`);
    }

    cmd.setColor(15);
  }

  resetAll() {
    cmd.clear();

    this.outputInterface();
    this.showBank();
    this.showDiceTemplate();
    this.showDice();
  }
}