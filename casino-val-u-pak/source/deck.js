class Deck {
  currentCard;
  deckOfCards = [];

  constructor(...args) {
    if (args.length === 0) {
      for (let f = 1; f <= 13; f++) {
        for (let s = 1; s <= 4; s++) {
          const newCard = new Card(f, s);
          this.deckOfCards.push(newCard);
        }
      }
    } else if (Array.isArray(args[0])) {
      const cardFaces = args[0];
      for (let c = 0; c < cardFaces.length; c++) {
        for (let s = 1; s <= 4; s++) {
          const newCard = new Card(cardFaces[c], s);
          this.deckOfCards.push(newCard);
        }
      }
    } else {
      for (let c = 0; c < args[0]; c++) {
        for (let f = 1; f <= 13; f++) {
          for (let s = 1; s <= 4; s++) {
            const newCard = new Card(f, s);
            this.deckOfCards.push(newCard);
          }
        }
      }
    }

    this.currentCard = 0;
  }

  shuffleDeck() {
    let cardHold;
    let randomCard = 0;

    for (let c = 0; c < this.deckOfCards.length; c++) {
      do { // make sure the card isn't being swapped with itself
        randomCard = floor(random(this.deckOfCards.length));
      } while (randomCard === c);

      // swap the next card with a randomly selected card
      cardHold = this.deckOfCards[c];
      this.deckOfCards[c] = this.deckOfCards[randomCard];
      this.deckOfCards[randomCard] = cardHold;
    }

    this.currentCard = 0;
  }

  dealCard() {
    // "deal" the next card
    return this.deckOfCards[this.currentCard++];
  }

  moreCards() {
    if (this.currentCard < this.deckOfCards.length) { // still cards left to deal
      return true;
    }
    return false;
  }

  cardsLeft() {
    return this.deckOfCards.length - this.currentCard;
  }
}