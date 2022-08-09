class IrishSnap {
  // player and dealer cards
  pCards = [];
  dCards = [];
  // discard pile
  discard = [];

  // tracks last 2 cards discarded
  lastCard;
  currentCard;

  bank;
  bet;

  // opponent info
  oppNum;
  opponentName;
  reactAvg;
  reactVar;
  betReturn;

  async play(bank) {
    cmd.setConsoleTitle('Irish Snap - Casino Val-U-Pak - Vezi-Play');

    cmd.clear();

    cmd.systemColor('20');

    await cmd.setWindowHeight(600);

    this.bank = bank;

    await this.pickOpponent();

    await this.getBet();

    // create a deck with only specific cards in it
    const snapDeck = new Deck([1, 10, 11, 12, 13]);

    snapDeck.shuffleDeck();

    // deal out the entire deck
    while (snapDeck.cardsLeft()) {
      this.pCards.push(snapDeck.dealCard());
      this.dCards.push(snapDeck.dealCard());
    }

    // start each round on player's turn
    let playerTurn = true, firstCard = true, cardsLeft = true;

    const CONTINUE = 0;
    const PWIN = 1;
    const PLOSE = 2;
    const DWIN = 3;
    let state;

    do { // game loop
      // reset each loop
      firstCard = true;
      state = CONTINUE;

      cmd.clear();

      cmd.setColor(46);
      cmd.centerString(1, `${this.opponentName}'s Cards`);
      cmd.centerString(44, `${playerName}'s Cards`);

      // print each hand face down in their respective places
      await Card.printBackSet(this.dCards.length, 3, true);
      await Card.printBackSet(this.pCards.length, 31, true);

      this.showCardCount();

      do { // card flip loop
        if (playerTurn) {
          this.flipCard(this.pCards);

          this.clearCardRow(31);
          await Card.printBackSet(this.pCards.length, 31, true);

          // wait for user to hit enter to flip card
          cmd.setColor(46);
          cmd.gotoxy(50, 22);
          cmd.cout('Press enter to flip...');
          cmd.setColor(34); // green-on-green
          cmd.gotoxy(0, 0);
          await cmd.pause();
          cmd.gotoxy(50, 22);
          cmd.cout('                      ');

          this.playCardSound();
          this.currentCard.printCard(35, 16, true);

          this.showCardCount();

          if (!firstCard) {
            state = await this.getSnap();
          } else { // don't allow snap when only 1 card is flipped
            firstCard = false;
          }

          this.lastCard = this.currentCard;
        } else { // dealer turn
          this.flipCard(this.dCards);

          this.clearCardRow(3);
          await Card.printBackSet(this.dCards.length, 3, true);

          // create a random delay before flipping the card over
          await sleep(100 + random(1900));

          this.playCardSound();
          this.currentCard.printCard(31, 18, true);

          this.showCardCount();

          if (!firstCard) {
            state = await this.getSnap();
          } else { // don't allow snap when only 1 card is flipped
            firstCard = false;
          }

          this.lastCard = this.currentCard;
        }

        cardsLeft = (this.pCards.length !== 0 && this.dCards.length !== 0);

        playerTurn = !playerTurn; // switch turns
      } while (state === CONTINUE && cardsLeft);

      // when someone snaps, output message
      if (state !== CONTINUE) {
        await this.showResults(state);
      }

      if (state === PWIN) {
        // player snapped on match OR dealer snapped on non-match
        // dealer picks up discard pile
        this.pickUpDiscard(this.dCards);
        this.shuffleCardSet(this.dCards);
      } else if (state === DWIN || state === PLOSE) {
        // player snapped on non-match OR dealer snapped on match
        // player picks up discard pile
        this.pickUpDiscard(this.pCards);
        this.shuffleCardSet(this.pCards);
      }
      
      cardsLeft = (this.pCards.length !== 0 && this.dCards.length !== 0);
    } while (cardsLeft);

    // at this point, state === CONTINUE but someone ran out of cards!

    // print border for message
    cmd.setColor(46);
    cmd.centerString(20, '                                       ');
    cmd.centerString(21, '                                       ');
    cmd.centerString(22, '                                       ');
    cmd.centerString(23, '                                       ');
    cmd.centerString(24, '                                       ');
    cmd.centerString(25, '                                       ');
    cmd.centerString(26, '                                       ');
    cmd.centerString(21, '**************');
    cmd.centerString(23, '**************');
    if (this.pCards.length === 0) { // player wins game
      cmd.centerString(22, '*PLAYER WINS!*');

      const betReturn = round(this.bet * this.betReturn);
      this.bank += betReturn;

      cmd.gotoxy(28, 25); cmd.cout(`<<<<<Return: $${betReturn}>>>>>`);
    } else { // dealer wins game
      cmd.centerString(22, '*Dealer wins.*');

      this.bank -= this.bet;
    }

    // wait for user to hit enter
    cmd.setColor(34); // green-on-green
    cmd.gotoxy(0, 0);
    await cmd.pause();

    return this.bank;
  }

  async pickOpponent() {
    cmd.clear();

    cmd.setColor(46);

    cmd.centerString(10, 'Welcome, ' + playerName + ', to Irish Snap!');

    cmd.centerString(12, 'Your goal is to get rid of ALL your cards.');
    cmd.centerString(13, 'You and the dealer will take turns flipping cards into the discard pile.');
    cmd.centerString(14, 'If any card flipped onto the pile is the same face as the card under it, SNAP!');
    cmd.centerString(15, 'When someone SNAPS on a pair, the other person has to pick up the discard pile.');

    cmd.centerString(17, 'Press ENTER to flip the next card, and press SPACE to snap.');

    cmd.centerString(19, 'Now, choose your opponent from the following...');
    cmd.centerString(20, 'Note: the more skilled your opponent, the higher the return.');

    cmd.gotoxy(4, 24); cmd.cout('(1)            A Snapping Turtle - "Snap? . . . I like to snap..."');
    cmd.gotoxy(4, 26); cmd.cout('(2)    Archibald Snappington III - "I say, the crumpets are delicious!"');
    cmd.gotoxy(4, 28); cmd.cout('(3)              The Snap Dealer - "I deal the cards. I AM THE CARDS."');
    cmd.gotoxy(4, 30); cmd.cout('(4)                    Robot 1-X - They say he\'s unbeatable.');

    do { // get opponent option
      this.oppNum = await cmd.getch();
    } while (this.oppNum < '1' || this.oppNum > '4');

    cmd.clear();

    switch (this.oppNum) {
      case '1':
        this.opponentName = 'Turtle';
        this.reactAvg = 900;
        this.reactVar = 100;
        this.betReturn = 0.5;
        break;
      case '2':
        this.opponentName = 'Archie';
        this.reactAvg = 400;
        this.reactVar = 50;
        this.betReturn = 1.0;
        break;
      case '3':
        this.opponentName = 'The Dealer';
        this.reactAvg = 325;
        this.reactVar = 25;
        this.betReturn = 3.0;
        break;
      case '4':
        this.opponentName = 'Robot 1-X';
        this.reactAvg = 250;
        this.reactVar = 0;
        this.betReturn = 100.0;
        break;
    }
  }

  async getBet() {
    do { // get a valid bet
      cmd.clear();

      cmd.gotoxy(15, 22); cmd.cout(`Enter your bet for this round (Bank = $${this.bank}):`);

      cmd.gotoxy(38, 24);
      cmd.cout('$');
      this.bet = Number(await cmd.getline({ include: /[0-9]/ }));
    } while (this.bet < 0 || this.bet > this.bank);
  }

  flipCard(hand) {
    this.currentCard = hand[0];

    // remove the next card from the hand
    hand.shift();

    // add card to the discard pile
    this.discard.push(this.currentCard);
  }

  async getSnap() {
    const wait = 1000; // time allowed for a "snap"

    let match = false;

    if (this.lastCard.face === this.currentCard.face) {
      match = true;
    }

    const startTime = millis();
    const offset = millis() + wait;

    const dealerReactionTime = (offset-(wait-(this.reactAvg + random(this.reactVar))));

    let timeUp = false;
    let dealerSnap = false;
    let key;
    do {
      key = await cmd.getch({
        interval: 0, // continuously check for timeouts
        onInterval: function() {
          if (offset < millis()) {
            timeUp = true;
            return true; // cancel getch()
          }
          if (match && dealerReactionTime <= millis()) {
            dealerSnap = true;
            return true; // cancel getch()
          }
        },
      });
    } while (key !== ' ' && !stop);

    if (dealerSnap) {
      return 3; // dealer snapped on match
    } else if (!timeUp) {
      cmd.setColor(46);
      cmd.gotoxy(76, 44);
      cmd.cout('    ');
      cmd.gotoxy(76, 44);
      cmd.cout(`${round(millis() - startTime)}`);

      if (match) {
        return 1; // player snapped on match
      } else {
        return 2; // player snapped on non-match
      }
    }

    return 0; // no one snapped
  }

  shuffleCardSet(hand) {
    const cardCount = hand.length; // number of cards

    for (let c = 0; c < cardCount; c++) {
      let randomSwap = 0;

      do { // make sure card isn't swapped with itself
        randomSwap = floor(random(cardCount));
      } while (randomSwap === c);

      const temp = hand[c];
      hand[c] = hand[randomSwap];
      hand[randomSwap] = temp;
    }
  }

  showCardCount() {
    cmd.setColor(46);
    cmd.gotoxy(17, 16); cmd.cout('   ');
    cmd.gotoxy(12, 22); cmd.cout('   ');
    cmd.gotoxy(17, 29); cmd.cout('   ');
    cmd.gotoxy( 3, 16); cmd.cout(`Dealer cards: ${this.dCards.length}`);
    cmd.gotoxy( 3, 22); cmd.cout(`Discard: ${this.discard.length}`);
    cmd.gotoxy( 3, 29); cmd.cout(`Player cards: ${this.pCards.length}`);

    cmd.gotoxy( 3, 44); cmd.cout(`Bet: $${this.bet}`);
  }

  async showResults(state) {
    cmd.setColor(46);
    let results = '';

    switch (state) {
      case 1:
        results = 'You snapped on a match!';
        break;
      case 2:
        results = 'You snapped, but it\'s not a match!';
        break;
      case 3:
        results = 'The dealer snapped on the match!';
        break;
      case 4:
        results = 'The dealer snapped, but it\'s not a match!';
        break;
    }
    let border = '**'; // start with 2, for corners
    for (let c = 0; c < results.length; c++) {
      border += '*';
    }
    cmd.centerString(21, border);
    cmd.centerString(22, `*${results}*`);
    cmd.centerString(23, border);

    // pause on message
    cmd.setColor(34); // green-on-green
    cmd.gotoxy(0, 0);
    await sleep(1000); // wait, in case of accidental button
    await cmd.pause();
  }

  pickUpDiscard(copyTo) {
    while (this.discard.length > 0) {
      copyTo.push(...this.discard);
      this.discard.length = 0;
    }
  }

  clearCardRow(row) {
    cmd.gotoxy(0, row);
    cmd.setColor(34);
    for (let c = 0; c < 12; c++) {
      for (let d = 0; d < 79; d++) {
        cmd.cout(' ');
      }
      cmd.endl();
    }
  }

  playCardSound() {
    let sound = 1 + floor(random(5));

    switch (sound) {
      case 1:
        deal1.play();
        break;
      case 2:
        deal2.play();
        break;
      case 3:
        deal3.play();
        break;
      case 4:
        deal4.play();
        break;
      case 5:
        deal5.play();
        break;
    }
  }
}