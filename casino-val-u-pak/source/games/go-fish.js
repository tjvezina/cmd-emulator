class GoFish {
  // create a new deck of cards
  goFishDeck = new Deck();

  // create an array for each player's hand
  pCards = [];
  dCards = [];

  // dealer AI simulated by tracking what cards player asks for
  faceTrack = [];

  // tracks the number of pairs made by each player
  pPairs = 0;
  dPairs = 0;

  // user's bank balance
  bank;
  bet;

  async play(bank) {
    this.bank = bank;

    cmd.clear();

    cmd.setConsoleTitle('Go Fish - Casino Val-U-Pak - Vezi-Play');

    await this.showGoFishLogo();

    await cmd.setWindowHeight(600);

    this.goFishDeck.shuffleDeck();

    await this.getPlayerBet();

    if (this.bet === 0) { // player wants to quit
      return bank;
    }

    this.showInterface();

    // deal 5 cards to each hand and print them
    for (let c = 0; c < 5; c++) {
      // this.pCards.push(this.goFishDeck.dealCard());
      // this.dCards.push(this.goFishDeck.dealCard());
      await this.drawCard(this.pCards, true);
      await this.drawCard(this.dCards, false);
    }

    cmd.setColor(46);
    this.showCardsLeft();

    Card.sortCards(this.pCards);
    Card.sortCards(this.dCards);

    // output the player's and dealer's cards
    await Card.printBackSet(this.dCards.length, 3, true);
    await Card.printCardSet(this.pCards, 31, true);

    await sleep(1000); // allow player to view cards

    await this.pairCheck(this.pCards, true);
    await this.pairCheck(this.dCards, false);

    // each turn returns a bool, true for player's trun, false for dealer's turn
    let pTurn = true;

    // game loop - continues until all cards have been dealt
    // bool "pTurn" (player's turn) indicates which function to call
    // each turn returns a bool to indicate next turn (i.e. play doesn't
    // always pass back and forth, player may have multiple turns)
    do {
      if (pTurn) {
        pTurn = await this.playerTurn();
      } else {
        pTurn = await this.dealerTurn();
      }
    } while (this.pCards.length + this.dCards.length !== 0);

    cmd.setColor(46);

    if (this.pPairs > this.dPairs) {
      const betReturn = ((this.pPairs - this.dPairs) * 0.25) + 0.5;

      this.bank += round(this.bet * betReturn);

      cmd.gotoxy(32, 19); cmd.cout('A WINRAR IS YOU!');

      cmd.gotoxy(29, 22); cmd.cout(`${this.pPairs} pairs = ${this.bet} x ${betReturn}`);
      cmd.gotoxy(29, 24); cmd.cout(`You've won $${round(this.bet * betReturn)}!`);
      cmd.gotoxy(29, 26); cmd.cout('Press enter to continue.');

      let loopCount = true;

      await cmd.getch({
        onInterval: function() {
          if (loopCount) {
            cmd.gotoxy(30, 18); cmd.cout(' * * * * * * * * * *');
            cmd.gotoxy(30, 20); cmd.cout(' * * * * * * * * * *');
            cmd.gotoxy(30, 19); cmd.cout('*');
            cmd.gotoxy(49, 19); cmd.cout(' ');
          } else {
            cmd.gotoxy(30, 18); cmd.cout('* * * * * * * * * * ');
            cmd.gotoxy(30, 20); cmd.cout('* * * * * * * * * * ');
            cmd.gotoxy(30, 19); cmd.cout(' ');
            cmd.gotoxy(49, 19); cmd.cout('*');
          }
          loopCount = !loopCount;
        }
      });
    } else if (this.pPairs < this.dPairs) {
      cmd.gotoxy(27, 22); cmd.cout('Aww, nuts, the dealer won.');
      cmd.gotoxy(25, 25); await cmd.pause();

      this.bank -= this.bet;
    } else { // this.pPairs === this.dPairs
      cmd.gotoxy(36, 22); cmd.cout('Tie Game!');
      cmd.gotoxy(25, 25); await cmd.pause();
    }

    return this.bank;
  }

  async showGoFishLogo() {
    await cmd.setWindowHeight(0);

    const Q = 218, E = 191, A = 192, D = 217, W = 179, S = 196;

    const goFishLogo = [
      "      QSSSSSSSSSE     ,8,           ",
      "      W(QSSSSSE)W    ,888,          ",
      "      W)W     ASD   ,88888,         ",
      "      W(W   QSSSE  ,8888888,        ",
      "      W)W   ASE(W ,888888888,       ",
      "      W(W     W)W :8888|8888:       ",
      "      W)ASSSSSD(W  '\"  T  \"'         ",
      "      ASSSSSSSSSD    -=?=-          ",

      "QSSSSSSE QSSSSSE QSSSSSSSE QSE   QSE",
      "W(QSSSSD ASE(QSD W(QSSSE)W W)W   W(W",
      "W)W        W)W   W)W   ASD W(W   W)W",
      "W(ASSSE    W(W   W(ASSSSSE W)ASSSD(W",
      "W)QSSSD    W)W   ASSSSSE)W W(QSSSE)W",
      "W(W        W(W   QSE   W(W W)W   W(W",
      "W)W      QSD)ASE W(ASSSD)W W(W   W)W",
      "ASD      ASSSSSD ASSSSSSSD ASD   ASD",
    ];

    cmd.setColor(0); // display the logo in black-on-black to hide it before fade-in

    cmd.cout('\n\n');

    for (let c1 = 0; c1 < goFishLogo.length; c1++) {
      cmd.endl().cout('                      ');

      for (let c2 = 0; c2 < goFishLogo[0].length; c2++) {
        const next = goFishLogo[c1][c2];

        switch (next) {
          case 'Q':
            cmd.cout(Q);
            break;
          case 'E':
            cmd.cout(E);
            break;
          case 'A':
            cmd.cout(A);
            break;
          case 'D':
            cmd.cout(D);
            break;
          case 'W':
            cmd.cout(W);
            break;
          case 'S':
            cmd.cout(S);
            break;
          default:
            cmd.cout(next);
        }
      }
    }

    cmd.endl();

    // face in to green screen
    await sleep(100);
    cmd.systemColor('2');
    await sleep(100);
    cmd.systemColor('12');
    await sleep(100);
    cmd.systemColor('3A');
    await sleep(100);
    cmd.systemColor('2E');

    cmd.gotoxy(25, 20);
    await cmd.pause(); // wait for user to continue

    // fade out logo
    await sleep(100);
    cmd.systemColor('2A');
    await sleep(100);
    cmd.systemColor('26');
    await sleep(100);
    cmd.systemColor('23');
    await sleep(100);
    cmd.clear();
    await sleep(500);
  }

  async getPlayerBet() {
    cmd.setColor(46);

    cmd.centerString(16, 'GO FISH BETTING');
    cmd.centerString(17, 'Lose a game, you lose your bet.');
    cmd.centerString(18, 'Tie game (13-13 pairs) and you keep your bet.');
    cmd.centerString(19, 'The more pairs you get, the bigger the return!');

    cmd.centerString(21, 'Pairs:    Return:     Sample:  ');
    cmd.centerString(22, '  14       1.0x    $100 -> $200');
    cmd.centerString(23, '  15       1.5x    $100 -> $250');
    cmd.centerString(24, '  16       2.0x    $100 -> $300');
    cmd.centerString(25, '        ...and so on...        ');

    do {
      cmd.gotoxy(50, 27); cmd.cout('                              ');
      cmd.gotoxy(25, 27); cmd.cout('Enter a bet (bank = $' + this.bank + '): ');
      this.bet = await cmd.getline({ include: /[0-9]/ });
    } while (this.bet < 0 || this.bet > this.bank);

    cmd.clear();
  }

  showInterface() {
    cmd.systemColor('28'); // creates green background

    // for showing discard areas
    let x = 2;
    let y = 15;

    for (let discards = 0; discards < 2; discards++) {
      cmd.gotoxy(x, y);
      for (let c1 = 0; c1 < 12; c1++) {
        for (let c2 = 0; c2 < 13; c2++) {
          cmd.cout('#');
        }

        cmd.gotoxy(x, ++y);
      }
      x = 65;
      y = 19;
    }

    cmd.setColor(46);

    // card hand labels
    cmd.centerString(1, 'Dealer\'s Hand');
    cmd.centerString(44, playerName + '\'s Hand');

    // discard piles labels
    cmd.gotoxy( 2, 28); cmd.cout('Dealer Discard');
    cmd.gotoxy(64, 17); cmd.cout('Player Discard');

    cmd.gotoxy( 5, 27); cmd.cout('Pairs: ');
    cmd.gotoxy(67, 18); cmd.cout('Pairs: ');
    this.showPairs();

    cmd.gotoxy( 2, 44); cmd.cout('Bet: $' + this.bet);
    cmd.gotoxy(61, 44); cmd.cout('Cards in deck: ');
  }

  showPairs() {
    cmd.setColor(46);
    // discarded pair counters
    cmd.gotoxy(12, 27); cmd.cout(`${this.dPairs}`);
    cmd.gotoxy(74, 18); cmd.cout(`${this.pPairs}`);
  }

  showCardsLeft() {
    cmd.setColor(46);
    cmd.gotoxy(76, 44); cmd.cout('  ');
    cmd.gotoxy(76, 44); cmd.cout(`${this.goFishDeck.cardsLeft()}`);
  }

  async playerTurn() {
    // player selects a card to ask for (testCard = subscript of the card)
    const testCard = await this.pickCard(this.pCards);
    const testCardFace = this.pCards[testCard].face;

    // check to see if dealer has card
    for (let c = 0; c < this.dCards.length; ++c) {
      // if dealer card face matches testCard face, dealer has the card
      if (this.dCards[c].face === testCardFace) {
        cmd.setColor(42);
        cmd.gotoxy(28, 16); cmd.cout('The dealer has that card!');

        await this.waitForAnyKey();

        // move the card to the player's hand
        const holder = this.dCards[c];
        await this.discard(this.dCards, c, false, false);
        this.pCards.push(holder);
        Card.sortCards(this.pCards);
        this.clearCardRow(31);
        await Card.printCardSet(this.pCards, 31, true);

        cmd.setColor(34);
        cmd.gotoxy(28, 16); cmd.cout('                         ');

        await sleep(1000);

        // discard the pair
        await this.pairCheck(this.pCards, true);

        cmd.setColor(34);
        cmd.gotoxy(28, 29); cmd.cout('                                     ');

        return true; // end player turn, still their turn
      }
    }

    // at this point, dealer does NOT have the requested card
    // add card to dealer's "memory" to simulate strategy
    this.faceTrackInc(testCardFace);

    cmd.setColor(44);
    cmd.gotoxy(36, 16); cmd.cout('GO FISH!');
    cmd.gotoxy(34, 17); cmd.cout('Draw a card.');
    await this.waitForAnyKey();
    cmd.gotoxy(36, 16); cmd.cout('        ');
    cmd.gotoxy(34, 17); cmd.cout('            ');

    const newCard = await this.drawCard(this.pCards, true, true);

    await this.pairCheck(this.pCards, true);
    
    // if the last card was drawn, exit the function
    if (this.goFishDeck.cardsLeft() === 0) {
      return false;
    }

    if (testCardFace === newCard) {
      cmd.setColor(42);
      cmd.gotoxy(24, 21); cmd.cout('You drew the card you asked for!');
      cmd.gotoxy(32, 22); cmd.cout('Your turn again.');
      await this.waitForAnyKey();
      cmd.gotoxy(24, 21); cmd.cout('                                ');
      cmd.gotoxy(32, 22); cmd.cout('                ');
      return true; // still player's turn
    }

    return false; // dealer's turn
  }

  async dealerTurn() {
    // the card the dealer will ask the player for
    let dCardAsk = -1;

    // first check dealer's "memory" for cards
    for (let c1 = 0; c1 < this.dCards.length; c1++) {
      for (let c2 = 0; c2 < this.faceTrack.length; c2++) {
        if (this.dCards[c1].face === this.faceTrack[c2]) {
          dCardAsk = c1;
        }
      }
    }

    if (dCardAsk === -1) { // no face in memory was selected
      dCardAsk = floor(random(this.dCards.length));
    }

    let dCardAskFace = this.dCards[dCardAsk].face;

    // Output dealer's request (conditions make it grammatically correct)
    cmd.setColor(46);
    cmd.gotoxy(24, 22); cmd.cout('Dealer: "Do you have ');
    for (let c = 0; c < 3; c++) {
      await sleep(500);
      cmd.cout('. ');
    }
    await sleep(1000);
    cmd.cout('a');
    if (dCardAskFace === 1 || dCardAskFace === 8) {
      cmd.cout('n'); // "an Ace" or "an 8" (yay grammar!)
    }
    cmd.cout(' ' + this.dCards[dCardAsk].getFaceName() + '?"');

    await this.waitForAnyKey();

    cmd.gotoxy(24, 22); cmd.cout('                                     ');

    // check for requested card in player's hand
    for (let c = 0; c < this.pCards.length; c++) {
      if (this.pCards[c].face === this.dCards[dCardAsk].face) {
        cmd.setColor(46);
        cmd.gotoxy(29, 22); cmd.cout('Sadly, you do have one.');

        // put the card in the dealer's hand
        const holder = this.pCards[c];
        await this.discard(this.pCards, c, true, false);
        this.dCards.push(holder);
        Card.sortCards(this.dCards);
        this.clearCardRow(3);
        await Card.printBackSet(this.dCards.length, 3, true);
        await sleep(1000);

        // remove the card from dealer's memory, if it's there
        this.faceTrackDec(dCardAskFace);

        cmd.setColor(34);
        cmd.gotoxy(29, 22); cmd.cout('                       ');

        // discard the pair
        await this.pairCheck(this.dCards, false);

        return false; // end dealer turn, still it's turn
      }
    }

    cmd.setColor(42);
    cmd.gotoxy(30, 28); cmd.cout('You: "GO FISH!"');
    cmd.gotoxy(33, 29); cmd.cout('"Draw a card!"');
    await this.waitForAnyKey();
    cmd.gotoxy(30, 28); cmd.cout('               ');
    cmd.gotoxy(33, 29); cmd.cout('              ');

    const newCard = await this.drawCard(this.dCards, false);

    await this.pairCheck(this.dCards, false);

    if (dCardAskFace === newCard) {
      cmd.setColor(44);
      cmd.gotoxy(23, 21); cmd.cout('Dealer draw the card he asked for.');
      cmd.gotoxy(30, 22); cmd.cout('Dealer\'s turn again.');
      await this.waitForAnyKey();
      cmd.gotoxy(23, 21); cmd.cout('                                  ');
      cmd.gotoxy(30, 22); cmd.cout('                    ');
      return false; // still dealer's turn
    }

    return true; // player's turn
  }

  faceTrackInc(newFace) {
    // make sure card isn't already in memory
    this.faceTrackDec(newFace);

    if (this.faceTrack.push(newFace) > 5) {
      this.faceTrack.shift();
    }
  }

  faceTrackDec(oldFace) {
    // if card is in memory, remove
    for (let c = 0; c < this.faceTrack.length; c++) {
      if (this.faceTrack[c] === oldFace) {
        this.faceTrack.splice(c, 1);
        break;
      }
    }
  }

  async discard(cards, n, isPlayer, showCard) {
    await sleep(200);
    const holder = cards[n]; // hold card to delete for printing in discard pile
    cards.splice(n, 1);

    if (isPlayer) {
      this.clearCardRow(31);
      if (showCard) {
        holder.printCard(65, 19, true);
      }
    } else {
      this.clearCardRow(3);
      if (showCard) {
        holder.printCard(2, 15, true);
      }
    }

    // if last card was discarded, draw 5 more cards
    if (cards.length === 0) {
      cmd.setColor(46);
      const cardsLeft = this.goFishDeck.cardsLeft();

      if (cardsLeft > 5) {
        cmd.gotoxy(25, 21); cmd.cout('Out of cards! Drawing 5 more.');
        for (let c = 0; c < 5; c++) {
          await this.drawCard(cards, isPlayer, false);
          await sleep(100);
        }
        await this.pairCheck(cards, isPlayer);
      } else if (cardsLeft <= 5 && cardsLeft > 0) {
        cmd.gotoxy(23, 21); cmd.cout('Out of cards! Drawing the last ');
        if (cardsLeft > 1) {
          cmd.cout(`${cardsLeft}.`);
        } else {
          cmd.cout('card!');
        }
        for (let c = 0; c < cardsLeft; c++) {
          await this.drawCard(cards, isPlayer, false);
        }
        await sleep(1000 - (100 * cardsLeft));
        await this.pairCheck(cards, isPlayer);
      }

      cmd.gotoxy(23, 21); cmd.cout('                                    ');
      return;
    }

    // reprint 'cards' array and print discarded card in discard pile
    if (isPlayer) {
      await Card.printCardSet(cards, 31, true);
    } else {
      await Card.printBackSet(cards.length, 3, true);
    }
  }

  async drawCard(cards, isPlayer, showCard) {
    // if no cards left in deck, don't draw a card
    if (this.goFishDeck.cardsLeft() === 0) {
      return 0;
    }

    const holder = this.goFishDeck.dealCard();

    const sound = 1 + floor(random(5));

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

    // print the drawn card in the middle of the screen
    // FOR PLAYER ONLY
    if (isPlayer && showCard) {
      cmd.setColor(46);
      cmd.gotoxy(38, 16); cmd.cout('Draw:');
      holder.printCard(34, 17, true);
      await this.waitForAnyKey();
      cmd.setColor(34);
      cmd.gotoxy(38, 16); cmd.cout('     ');
      for (let c = 0; c < 12; c++) {
        cmd.gotoxy(34, 17+c); cmd.cout('             ');
      }
    }

    cards.push(holder);
    Card.sortCards(cards);

    if (isPlayer) {
      this.clearCardRow(31);
      await Card.printCardSet(this.pCards, 31, true);
    } else {
      this.clearCardRow(3);
      await Card.printBackSet(cards.length, 3, true);
    }

    cmd.setColor(46);
    this.showCardsLeft();

    return holder.face;
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

  async pairCheck(cards, isPlayer) {
    for (let c = 0; c < cards.length-1; c++) {
      // this terminates the function when no cards remain in the deck,
      // or in the players' hands, before attempting to use cards[c],
      // which is of course out of range if there are no cards
      if (cards.length === 0) {
        return;
      }

      const face1 = cards[c].face;
      const face2 = cards[c+1].face;

      if (face1 === face2) {
        const faceName = cards[c].getFaceName();

        if (isPlayer) { // display what pair was made by who
          cmd.setColor(42);
          cmd.gotoxy(29, 29);
          cmd.cout('You have a pair of ' + faceName + 's!');
          ++this.pPairs;
          this.faceTrackDec(face1);
        } else {
          cmd.setColor(44);
          cmd.gotoxy(28, 16);
          cmd.cout(' Dealer has a pair of ' + faceName + 's.');
          ++this.dPairs;
        }

        this.showPairs();

        await this.discard(cards, c, isPlayer, true);
        await this.discard(cards, c, isPlayer, true);

        await sleep(500); // let the player see what pair was moved
        cmd.setColor(34);

        if (isPlayer) { // clear the text printed
          cmd.gotoxy(29, 29);
          cmd.cout('                               ');
        } else {
          cmd.gotoxy(29, 16);
          cmd.cout('                                ');
        }

        c--; // go back to account for the discarded pair
      }
    }
  }

  async pickCard(cards) {
    let faceCheck = ''; // the face of the card the player will ask for

    do { // loop until a valid card is selected
      cmd.setColor(46);
      cmd.gotoxy(23, 21); cmd.cout('Enter the card you want to ask for:');
      cmd.gotoxy(30, 22); cmd.cout('(i.e. \"Jack\" or \"7\"):')
      cmd.setColor(43);

      do { // prevents the player from pressing "Enter" and typing the value on the left edge of the screen
        cmd.gotoxy(39, 23);
        faceCheck = await cmd.getline({ limit: 5 });
      } while (faceCheck.length === 0);

      // clear the text on-screen
      cmd.gotoxy(23, 21); cmd.cout('                                   ');
      cmd.gotoxy(30, 22); cmd.cout('                         ');
      cmd.gotoxy(39, 23); cmd.cout('               ');

      // allow multiple forms of input for face cards
      if (faceCheck === 'ace' || faceCheck === 'a' || faceCheck === 'A') {
        faceCheck = 'Ace';
      } else if (faceCheck === 'jack' || faceCheck === 'j' || faceCheck === 'J') {
        faceCheck = 'Jack';
      } else if (faceCheck === 'queen' || faceCheck === 'q' || faceCheck === 'Q') {
        faceCheck = 'Queen';
      } else if (faceCheck === 'king' || faceCheck === 'k' || faceCheck === 'K') {
        faceCheck = 'King';
      }

      for (let c = 0; c < cards.length; c++) {
        // if the name entered matches a card in the player's hand
        if (cards[c].getFaceName() === faceCheck) {
          return c; // return subscript of the card being asked for
        }
      }

      // inform player of invalid input and loop
      cmd.gotoxy(28, 22); cmd.cout('You don\'t have that card...');
      await this.waitForAnyKey();
      cmd.gotoxy(28, 22); cmd.cout('                           ');
    } while (true);
  }

  async waitForAnyKey() {
    cmd.setColor(34); // set to green-on-green to hide the text
    cmd.gotoxy(25, 30);
    await cmd.pause();
  }
}