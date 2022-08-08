class Blackjack {
  bank = 100;
  bet = 50;
  pushTotal = 0;

  async play(bank) {
    cmd.setConsoleTitle('Blackjack - Casino Val-U-Pak - Vezi-Play');

    await cmd.setWindowHeight(540);

    cmd.clear();
    cmd.systemColor('10'); // sets background to blue

    // initialize bank to current user's balance
    this.bank = bank;

    while (this.bank > 0 && this.bet > 0) {
      await this.playHand();

      cmd.clear();
    }

    if (this.bet === 0) { // stopped playing
      cmd.gotoxy(27, 16); cmd.cout('<<< Winnings: $' + `${this.bank}`.padEnd(5) + ' >>>');
    } else { // ran out of money
      cmd.gotoxy(23, 15); cmd.cout('<<< At least it\'s fake money. >>>');
    }

    cmd.gotoxy(25, 24);
    await cmd.pause();

    return this.bank;
  }

  async playHand() {
    const myDeck = new Deck();
    myDeck.shuffleDeck();

    this.showPlayerTable();
    this.showDealerTable();

    do {
      if (this.pushTotal > 0) {
        cmd.gotoxy(24, 18);
        cmd.setColor(31);
        cmd.cout('   Push - last bet was: ');
        cmd.setColor(26);
        cmd.cout('$' + this.pushTotal);
      }

      cmd.gotoxy(18, 19);
      cmd.setColor(31);
      cmd.cout('Place your bet (bank = $' + this.bank + '): ');
      cmd.setColor(26);
      cmd.cout('$');

      this.bet = Number(await cmd.getline({ include: /[0-9]/ }));

      if (this.bet === 0) {
        return;
      }

      cmd.gotoxy(24, 18);
      cmd.cout('                               ');
      cmd.gotoxy(18, 19);
      cmd.cout('                                                    ');
    } while (this.bet < 0 || this.bet > this.bank); // loop until valid input

    this.bet += this.pushTotal; // track push total in case of tie

    this.showBankAndBet();

    cmd.setColor(27);
    cmd.gotoxy(57, 18);
    cmd.cout('H = Hit Me');
    cmd.gotoxy(57, 20);
    cmd.cout('S = Stay');

    // initialize 2 arrays for player & Dealer cards
    const pCards = [];
    const dCards = [];

    // draw 2 cards for the player
    pCards.push(myDeck.dealCard());
    pCards[0].printCard(8, 4, true);

    pCards.push(myDeck.dealCard());
    pCards[1].printCard(24, 4, true);

    let pAces = 0;

    if (pCards[0].face === 1) {
      pAces++;
    }
    if (pCards[1].face === 1) {
      pAces++;
    }

    let pTotal = this.getValue(pCards[0]) + this.getValue(pCards[1]);

    if (pTotal > 21 && pAces > 0) {
      pTotal -= 10; // if over 21 with an ace, change ace to low (1 point)
      pAces--;
    }

    this.showPlayerScore(pTotal);

    // draw 2 cards for the Dealer
    dCards.push(myDeck.dealCard());
    dCards[0].printCard(8, 23, true);

    dCards.push(myDeck.dealCard());
    Card.printBack(24, 23, true);

    let dAces = 0;

    if (dCards[0].face === 1) {
      dAces++;
    }
    if (dCards[1].face === 1) {
      dAces++;
    }

    let dTotal = this.getValue(dCards[0]) + this.getValue(dCards[1]);

    if (dTotal > 21 && dAces > 0) {
      dTotal -= 10; // if over 21 with an ace, change ace to low (1 point)
      dAces--;
    }

    // second card is face down, only total the first
    this.showDealerScore(this.getValue(dCards[0]));

    let cardNumber = 2;
    let endGame = false, blackjack = false;
    let move = 0;

    if (pTotal === 21) {
      blackjack = true;
    }

    if (!blackjack) { // if the player didn't start with Blackjack
      do { // check for player choice
        do { // wait for valid keyboard button
          move = await cmd.getch();
        } while (move !== 's' && move !== 'S' && move !== 'h' && move !== 'H');

        if (move === 'h' || move === 'H') { // if player chooses hit
          cardNumber++;

          pCards.push(myDeck.dealCard());

          if (pCards[cardNumber - 1].face === 1) {
            pAces++;
          }

          if (cardNumber < 5) {
            pCards[cardNumber - 1].printCard((cardNumber*16)-8, 4, true);
          } else {
            pCards[cardNumber - 1].printCard(((cardNumber-4)*16)-5, 4, true);
          }

          pTotal += this.getValue(pCards[cardNumber - 1]);

          if (pTotal > 21 && pAces > 0) {
            pTotal -= 10; // if over 21 with an ace, change ace to low (1 point)
            pAces--;
          }
          if (pTotal >= 21) {
            endGame = true;
          }

          this.showPlayerScore(pTotal);
        }
      } while (move !== 's' && move !== 'S' && !endGame);
    } else { // if player got blackjack
      // show Dealer's hand
      dCards[1].printCard(24, 23, true);
      this.showDealerScore(dTotal);

      cmd.gotoxy(35, 19);
      cmd.setColor(28);
      if (dTotal !== 21) {
        cmd.cout('BLACKJACK!');
        this.bank += (this.bet * 3 / 2);
        this.pushTotal = 0;
      } else {
        cmd.cout('Tie - push.');
        if (this.pushTotal === 0) {
          this.pushTotal = this.bet;
        }
      }

      await cmd.getch();
      return;
    }

    if (!endGame || pTotal === 21) { // player chose "stay" or reached 21
      // show Dealer's hand
      dCards[1].printCard(24, 23, true);
      this.showDealerScore(dTotal);

      // delay between each move to allow user to follow
      await sleep(500);

      // Dealer's turn; automatically add cards while score < player score
      // reuse variable "cardNumber" from player's turn
      cardNumber = 2;
      while (dTotal < pTotal) {
        cardNumber++;

        dCards.push(myDeck.dealCard());

        if (dCards[cardNumber - 1].face === 1) {
          dAces++;
        }

        if (cardNumber < 5) {
          dCards[cardNumber - 1].printCard((cardNumber*16)-8, 23, true);
        } else {
          dCards[cardNumber - 1].printCard(((cardNumber-4)*16)-5, 23, true);
        }

        dTotal += this.getValue(dCards[cardNumber - 1]);

        if (dTotal > 21 && dAces > 0) {
          dTotal -= 10; // if over 21 with an ace, change ace to low (1 point)
          dAces--;
        }

        this.showDealerScore(dTotal);

        // delay between each move to allow user to follow
        await sleep(500);
      }

      cmd.gotoxy(33, 19);
      cmd.setColor(28);
      if (dTotal > 21) { // if opp busted
        cmd.cout('Player wins!');
        this.bank += this.bet;
        this.pushTotal = 0;
      } else if (dTotal === pTotal) {
        cmd.cout('Tie - push.');
        if (this.pushTotal === 0) {
          this.pushTotal = this.bet;
        }
      } else {
        cmd.cout('Dealer wins.');
        this.bank -= this.bet;
        this.pushTotal = 0;
      }

      await cmd.getch();
      return;
    } else { // player buster
      // show Dealer's hand
      dCards[1].printCard(24, 23, true);
      this.showDealerScore(dTotal);

      cmd.gotoxy(33, 19);
      cmd.setColor(28);
      cmd.cout('Dealer wins.');
      this.bank -= this.bet;
      this.pushTotal = 0;

      await cmd.getch();
      return;
    }
  }

  getValue(c) {
    let face = c.face;

    if (face > 9 && face < 14) { // 10 & face cards
      return 10;
    } else if (face === 1) { // ace
      return 11;
    } else {
      return face;
    }
  }

  showPlayerTable() {
    let tableX = 7, tableY = 3;
    Card.outputTable(tableX, tableY, 66, 14);
    cmd.gotoxy(tableX + 1, tableY);
    cmd.setColor(70);
    cmd.cout(' ' + playerName + '\'s Table ');
  }

  showPlayerScore(score) {
    cmd.setColor(31);
    cmd.gotoxy(9, 18);
    cmd.cout('Card total: ');
    if (score < 21) {
      cmd.setColor(30);
    } else if (score === 21) {
      cmd.setColor(26);
    } else {
      cmd.setColor(28);
    }
    cmd.cout(`${score}`);
  }

  showDealerTable() {
    let tableX = 7, tableY = 22;
    Card.outputTable(tableX, tableY, 66, 14);
    cmd.gotoxy(tableX + 1, tableY);
    cmd.setColor(70);
    cmd.cout(' Dealer\'s Table ');
  }

  showDealerScore(score) {
    cmd.setColor(31);
    cmd.gotoxy(9, 37);
    cmd.cout('Card total: ');
    if (score < 21) {
      cmd.setColor(30);
    } else if (score === 21) {
      cmd.setColor(26);
    } else {
      cmd.setColor(28);
    }
    cmd.cout(`${score}`);
  }

  showBankAndBet() {
    cmd.gotoxy(8, 20);
    cmd.setColor(31);
    cmd.cout('Bank: ');
    cmd.setColor(26);
    cmd.cout('$' + this.bank);
    cmd.setColor(31);
    cmd.cout('\tBet: ');
    cmd.setColor(26);
    cmd.cout('$' + this.bet);
  }
}