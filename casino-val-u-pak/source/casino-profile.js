class CasinoProfile {
  userName = '< empty >';
  passWord = '';
  bankBalance = 0;

  constructor(userName, passWord) {
    if (userName !== undefined) {
      Object.assign(this, {
        userName,
        passWord,
        bankBalance: 100,
      });
    }
  }

  showProfileInfo() {
    // used to test for an <empty> profile
    let userName = '';

    // output user name, then a series of dots
    if (this.userName === '< empty >') {
      cmd.setColor(8);
      cmd.cout(this.userName);
      cmd.setColor(14);
      return; // output "empty" in gray only
    }

    // determine number of digits in the score for output formatting
    let digits = 0;
    let bankTest = this.bankBalance;

    while (bankTest > 0) {
      bankTest = floor(bankTest / 10);
      digits++;
    }

    // bank should never be empty - in case of error, reset to $100
    if (this.bankBalance === 0) {
      this.bankBalance = 100;
      digits = 3;
    }

    const scoreSpace = 16 - digits - floor((digits-1) / 3); // account for comma (i.e. "$3,465")

    cmd.cout(this.userName.padEnd(22) + '$'.padStart(scoreSpace));

    // reset bankTest for reuse
    bankTest = this.bankBalance;

    for (let c = digits; c > 0; c--) {
      // i.e. digit 4 = score / 10^3 = 3985 / 1000 = 3
      const currentDigit = floor(bankTest / pow(10, c-1));
      cmd.cout(`${currentDigit}`);

      bankTest -= currentDigit * pow(10, c-1);

      if ((c-1) % 3 === 0 && (c-1) !== 0) {
        cmd.cout(',');
      }
    }
  }
}
