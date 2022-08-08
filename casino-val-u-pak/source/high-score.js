class HighScore {
  username;
  score;

  constructor(username, score) {
    Object.assign(this, { username, score });
  }

  printScore() {
    // determine number of digits in the score for output formatting
    let digits = 0;
    let scoreTest = this.score;

    while (scoreTest > 0) {
      scoreTest = floor(scoreTest / 10);
      digits++;
    }

    // consider a score of $0
    if (score === 0) {
      digits = 1;
    }

    let scoreSpace = 24 - digits - floor((digits-1) / 3); // account for comma (i.e. "$3,465")

    cmd.cout(this.username.padEnd(24, '.') + '$'.padStart(scoreSpace));

    // reset scoreTest for reuse
    scoreTest = score;

    for (let c = digits; c > 0; c--) {
      // i.e. digit 4 = score / 10^3 = 3985 / 1000 = 3
      let currentDigit = floor(scoreTest / pow(10, c-1));
      cmd.cout(`${currentDigit}`);

      scoreTest -= currentDigit * pow(10, c-1);

      if (c-1 % 3 === 0 && c-1 !== 0) {
        cmd.cout(',');
      }
    }

    cmd.endl();
  }

  printTitleLine() {
    cmd.cout('\t\tPlayer\'s Name                          Highscore\n');
    cmd.cout('\t\t================================================').endl();
  }
}