let cmdEmulator;

let accessDenied;
let ding;
let badDing;

let cardShuffle;
let deal1;
let deal2;
let deal3;
let deal4;
let deal5;

let diceRoll;
let diceShaker;

let logoSound;

let casinoTheme;

let playerName;
let bank;

// to store profiles for user selection
const totalProfiles = 20;
let profiles;
let loadedProfile; // the profile number for the current user
let currentUser; // the current user's profile

function preload() {
  loadSound('assets/access_denied.wav', result => accessDenied = result);
  loadSound('assets/Ding.wav', result => ding = result);
  loadSound('assets/BadDing.wav', result => badDing = result);

  loadSound('assets/card_shuffle.wav', result => cardShuffle = result);
  loadSound(`assets/card_deal1.wav`, result => deal1 = result);
  loadSound(`assets/card_deal2.wav`, result => deal2 = result);
  loadSound(`assets/card_deal3.wav`, result => deal3 = result);
  loadSound(`assets/card_deal4.wav`, result => deal4 = result);
  loadSound(`assets/card_deal5.wav`, result => deal5 = result);

  loadSound('assets/dice_roll.wav', result => diceRoll = result);
  loadSound('assets/dice_shake_short.wav', result => diceShaker = result);

  loadSound('assets/VeziPlayLogoSound.wav', result => logoSound = result);

  loadSound('assets/CasinoTheme.mp3', result => casinoTheme = result);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  cmdEmulator = new CmdEmulator({ main, exeName: 'CASINO VAL-U-PAK' });
}

function draw() {
  cmdEmulator.draw();
}

async function main() {
  playerName = '';
  bank = 0;
  profiles = [];
  loadedProfile = 0;
  currentUser = undefined;

  cmd.setConsoleTitle('C A S I N O   V A L - U - P A K        Vezi-Play');

  await showVeziPlayLogo();

  await cmd.setWindowHeight(0);

  casinoTheme.loop();
  casinoTheme.setVolume(0.25);

  // load profiles once at beginning of program
  loadCasinoProfiles();

  loadedProfile = getItem('loaded-profile') ?? 0;
  if (loadedProfile === 0) {
    await showMainMenu();
  } else {
    currentUser = profiles[loadedProfile - 1];
    playerName = currentUser.userName;
    bank = currentUser.bankBalance;
    if (await showUserMenu()) {
      await showMainMenu();
    }
  }

  // save profiles before end of program
  saveCasinoProfiles();

  // clear screen to indicate files were saves (in debug)
  cmd.clear();

  casinoTheme.stop();

  return 0;
}

async function showMainMenu() {
  let option = 0;

  let stayInMenu = true, passwordConfirm = true;

  while (stayInMenu) {
    loadedProfile = 0; //reset when user "logs out"
    storeItem('loaded-profile', 0);

    cmd.clear();
    cmd.systemColor('E');

    cmd.cout('\n  Welcome to the CASINO VAL-U-PAK!');
    cmd.cout('\n\n  Please make a selection from the following (ESC to exit):');

    cmd.cout('\n\n\t1:  Create New Profile');
    cmd.cout('\n\n\t2:  Load Profile');
    cmd.cout('\n\n\t3:  Delete Profile');

    do { // wait for valid keyboard button
      option = await cmd.getch();
    } while ((typeof option !== 'string' || (option < '1' || option > '3')) && option !== 27);

    ding.play();

    switch (option) {
      case '1':
        loadedProfile = await createNewProfile();
        break;
      case '2':
        loadedProfile = await selectProfile('a profile to load');
        if (loadedProfile !== 0) {
          cmd.clear();
          passwordConfirm = await confirmPassword(loadedProfile);
        }
        break;
      case '3':
        await deleteProfile();
        break;
      case 27: // ESC
        cmd.cout('\n\n  Now closing...\n\n  ');
        await cmd.pause();
        return; // end program
    }

    if (loadedProfile === 0) {
      continue;
    }

    if (!passwordConfirm) {
      cmd.clear();
      cmd.cout('\n  Invalid password.\n\n  ');
      accessDenied.play();
      await cmd.pause();
      passwordConfirm = true; // reset the bool
      continue;
    }

    currentUser = profiles[loadedProfile - 1];
    storeItem('loaded-profile', loadedProfile);

    playerName = currentUser.userName;
    bank = currentUser.bankBalance;

    stayInMenu = await showUserMenu();
  }
}

async function showUserMenu() {
  do {
    // loop user menu until 4 or ESC are selected
    // let user select game
    cmd.clear();
    cmd.systemColor('E');

    let option = 0;

    cmd.cout('\n  Welcome, ' + currentUser.userName + ', to the CASINO VAL-U-PAK!');
    cmd.cout('\n\n  Please make a selection from the following (ESC to exit):');

    cmd.cout('\n\n\t1:  PLAY SOME GAMES!');
    cmd.cout('\n\n\t2:  Change username');
    cmd.cout('\n\n\t3:  Change password');
    cmd.cout('\n\n\t4:  Log out (return to main menu)');

    do { // wait for valid keyboard button
      option = await cmd.getch();
    } while ((typeof option !== 'string' || (option < '1' || option > '4')) && option !== 27); // allow 1-4 or ESC

    ding.play();

    switch (option) {
      case '1':
        await showGameMenu();
        break;
      case '2':
        await changeUserName();
        break;
      case '3':
        await changePassWord();
        break;
      case '4':
        return true; // go back to main menu and show it
      case 27:
        return false; // go back to main menu and end program
    }
  } while (true);
}

async function changeUserName() {
  cmd.clear();

  let newUserName = '';

  cmd.cout('\n  Enter new profile user name:');

  let redo = true;

  do { // get username value
    cmd.gotoxy(31, 1);
    cmd.cout('                                        ');
    cmd.gotoxy(31, 1);
    newUserName = await cmd.getline({ limit: 20 });

    if (newUserName.length < 1 || newUserName.length > 20) {
      continue;
    }

    cmd.gotoxy(10, 3);
    cmd.cout('Is this the username you want (Y/N)?');

    let confirm = 0;
    do { // get confirmation
      confirm = await cmd.getch();
    } while (confirm !== 'y' && confirm !== 'Y' && confirm !== 'n' && confirm !== 'N');

    if (confirm === 'y' || confirm === 'Y') {
      redo = false; // if user is happy, continue
    }

    cmd.gotoxy(10, 3);
    cmd.cout('                                    ');
  } while (redo);

  currentUser.userName = newUserName;

  saveCasinoProfiles(); // save change
}

async function changePassWord() {
  cmd.clear();

  let newPassWord = '';

  cmd.cout('\n  Enter new profile password:');

  do { // get password loop
    do { // get password (first check)
      cmd.gotoxy(31, 1);
      cmd.cout('                                        ');
      cmd.gotoxy(31, 1);

      newPassWord = await cmd.getline({ isPassword: true });
    } while (newPassWord.length < 1);

    cmd.cout('\n\n  Confirm profile password:');
    let passCheck = '';

    do { // get password (second check)
      cmd.gotoxy(29, 3);
      cmd.cout('                                        ');
      cmd.gotoxy(29, 3);

      passCheck = await cmd.getline({ isPassword: true });
    } while (passCheck.length < 1);

    if (newPassWord === passCheck) {
      break; // passwords match, exit loop
    }

    cmd.gotoxy(10, 5);
    cmd.cout('Passwords don\'t match! Try again.');
    badDing.play();
    await cmd.getch(); // wait for user to press enter
    cmd.gotoxy(10, 5);
    cmd.cout('                                 ');
    cmd.gotoxy(29, 3);
    cmd.cout('                                       ');

    // reset passwords
    newPassWord = '';
    passCheck = '';
  } while (true);

  /*
    JS PORT NOTE: The original project's user account system was never meant to be legit or secure, but just in case
    someone types in a real password, store its SHA256 hash instead of plain text.
  */
  currentUser.passWord = await sha256(newPassWord);

  saveCasinoProfiles(); // save change
}

async function showGameMenu() {
  do { // loop until ESC
    cmd.clear();
    cmd.systemColor('E');

    cmd.cout('\n  Current user: ' + currentUser.userName + '\t\tBank Balance: $' + currentUser.bankBalance);
    cmd.cout('\n\n  Please make a selection from the following (ESC to go back):');

    cmd.cout('\n\n\t1:  Blackjack');
    cmd.cout('\n\n\t2:  Go Fish');
    cmd.cout('\n\n\t3:  Craps');
    cmd.cout('\n\n\t4:  Irish Snap');

    // reset after each game AFTER clearing and printing instructions (looks nice)
    await cmd.setWindowHeight(0);

    let option = 0;
 
    do { // wait for valid keyboard button
      option = await cmd.getch();
    } while ((typeof option !== 'string' || (option < '1' || option > '4')) && option !== 27); // allow 1-4 or ESC

    ding.play();

    const blackjackGame = new Blackjack();
    const goFishGame = new GoFish();
    const crapsGame = new Craps();
    const snapGame = new IrishSnap();

    switch (option) {
      case '1':
        bank = await blackjackGame.play(bank);
        break;
      case '2':
        bank = await goFishGame.play(bank);
        break;
      case '3':
        bank = await crapsGame.play(bank);
        break;
      case '4':
        bank = await snapGame.play(bank);
        break;
      case 27:
        return; // go back to user menu
    }

    // reset console title
    cmd.setConsoleTitle('C A S I N O   V A L - U - P A K        Vezi-Play');

    bank = max(0, round(bank));
    if (bank === 0) {
      bank = 100;

      cmd.clear();
      cmd.systemColor('E');
      cmd.cout('\n  You poor bum, lost all your money!\n\n  Here\'s a free $100 to get you going again...\n\n  ');
      await cmd.pause();
    }

    // update user's bank balance
    currentUser.bankBalance = bank;

    // update profile and save immediately after every game
    saveCasinoProfiles();
  } while (true);
}

async function createNewProfile() {
  // let user select a profile slot to use
  const newProfileSlot = await selectProfile('an empty slot', true);

  if (newProfileSlot === 0) { // user pressed ESC while choosing profile
    return 0;
  }

  let newUserName = '', newPassWord = '';

  cmd.clear();

  cmd.cout('\n  CREATE PROFILE\n\n  Enter a profile user name:');

  let redo = true;

  do { // get username value
    cmd.gotoxy(30, 3);
    cmd.cout('                                        ');
    cmd.gotoxy(30, 3);
    newUserName = await cmd.getline({ limit: 20 });

    if (newUserName.length < 1 || newUserName.length > 20) {
      continue;
    }

    cmd.gotoxy(10, 5);
    cmd.cout('Is this the username you want (Y/N)?');

    let confirm = 0;
    do { // get confirmation
      confirm = await cmd.getch();
    } while (confirm !== 'y' && confirm !== 'Y' && confirm !== 'n' && confirm !== 'N');

    if (confirm === 'y' || confirm === 'Y') {
      redo = false; // if user is happy, continue
    }

    cmd.gotoxy(10, 5);
    cmd.cout('                                    ');
  } while (redo);

  cmd.cout('\n\n  Enter a profile password:');

  do { // get password loop
    do { // get password (first check)
      cmd.gotoxy(29, 7);
      cmd.cout('                                        ');
      cmd.gotoxy(29, 7);

      newPassWord = await cmd.getline({ isPassword: true });
    } while (newPassWord.length < 1);

    cmd.cout('\n\n  Confirm profile password:');
    let passCheck = '';

    do { // get password (second check)
      cmd.gotoxy(29, 9);
      cmd.cout('                                        ');
      cmd.gotoxy(29, 9);

      passCheck = await cmd.getline({ isPassword: true });
    } while (passCheck.length < 1);

    if (newPassWord === passCheck) {
      break; // passwords match, exit loop
    }

    cmd.gotoxy(10, 11);
    cmd.cout('Passwords don\'t match! Try again.');
    badDing.play();
    await cmd.getch(); // wait for user to press enter
    cmd.gotoxy(10, 11);
    cmd.cout('                                 ');
    cmd.gotoxy(29, 9);
    cmd.cout('                                       ');

    // reset passwords
    newPassWord = '';
    passCheck = '';
  } while (true);

  /*
    JS PORT NOTE: The original project's user account system was never meant to be legit or secure, but just in case
    someone types in a real password, store its SHA256 hash instead of plain text.
  */
  const newProfile = new CasinoProfile(newUserName, await sha256(newPassWord));

  // set the new profile to the selected slot in the profiles array
  profiles[newProfileSlot - 1] = newProfile;

  // make sure new profile is saved, in case of unexpected program close
  saveCasinoProfiles();

  return newProfileSlot;
}

async function deleteProfile() {
  do {
    const profileNum = await selectProfile('a profile to delete');

    if (profileNum === 0) {
      return; // user hit ESC
    }

    cmd.clear();

    let passwordConfirm = await confirmPassword(profileNum);

    if (passwordConfirm) {
      cmd.gotoxy(5, 3);
      cmd.cout('Are you SURE you want to DELETE this profile (Y/N)?');

      let confirm = 0;
      do { // get confirmation
        confirm = await cmd.getch();
      } while (confirm !== 'y' && confirm !== 'Y' && confirm !== 'n' && confirm !== 'N');

      if (confirm === 'n' || confirm === 'N') {
        cmd.cout('\n\n  Profile was NOT deleted.\n\n  ');
        await cmd.pause();
        return;
      }

      const blank = new CasinoProfile();
      profiles[profileNum-1] = blank;
      saveCasinoProfiles();
      ding.play();
      cmd.cout('\n\n  Profile deleted.\n\n  ');
      await cmd.pause();
      return;
    }

    cmd.cout('\n\n  Invalid password.\n\n  ');
    accessDenied.play();
    await cmd.pause();
  } while (true);
}

async function selectProfile(type, newProfile) {
  cmd.clear();

  cmd.cout('\n  Select ' + type + ' (ESC to cancel):\n');

  for (let c = 0; c < totalProfiles; c++) {
    cmd.cout('\n  ' + `${c + 1}`.padStart(2) + ': ');
    profiles[c].showProfileInfo();
  }

  let choice = 1;

  cmd.gotoxy(0, 3);
  cmd.cout('->');

  do { // let user select profile
    let keyPress = await cmd.getch();

    if (keyPress === 27) {
      return 0;
    } else if (keyPress === 13 || keyPress === 32) { // enter or spacebar
      if (!newProfile) {
        if (profiles[choice-1].userName !== '< empty >') {
          return choice; // leave the option loop, if valid profile
        }
      } else {
        if (profiles[choice-1].userName === '< empty >') {
          return choice; // leave the option loop, if valid profile
        }
      }
    } else {
      switch (keyPress) {
        case UP_ARROW:
          if (choice > 1) {
            cmd.gotoxy(0, choice + 2);
            cmd.cout('  ');
            --choice;
            cmd.gotoxy(0, choice + 2);
            cmd.cout('->');
          }
          break;
        case DOWN_ARROW:
          if (choice < totalProfiles) {
            cmd.gotoxy(0, choice + 2);
            cmd.cout('  ');
            ++choice;
            cmd.gotoxy(0, choice + 2);
            cmd.cout('->');
          }
          break;
      }
    }
  } while (true);
}

async function confirmPassword(profileNum) {
  const username = profiles[profileNum-1].userName;
  const password = profiles[profileNum-1].passWord;
  let passCheck = '';

  cmd.cout(`\n  Enter password for ${username}: `);

  do
  { // get password
    cmd.gotoxy(23 + username.length, 1);
    cmd.cout('                                        ');
    cmd.gotoxy(23 + username.length, 1);

    passCheck = await cmd.getline({ isPassword: true });
  } while (passCheck.length < 1);

  if (password === await sha256(passCheck)) {
    return true;
  } else {
    return false;
  }
}

/*
  JS PORT NOTE: Saving and loading profiles is totally different in web; instead of serializing profile
  instances in a binary file, simply convert to and from JSON and store in the user's local cache.
*/
async function loadCasinoProfiles() {
  const profilesJSON = getItem('user-profiles');

  if (profilesJSON === null) {
    profiles = Array.from(new Array(totalProfiles), _ => new CasinoProfile());
  } else {
    profiles = JSON.parse(profilesJSON).map(profileData => {
      const profile = new CasinoProfile();
      Object.assign(profile, profileData);
      return profile;
    })
  }
}

function saveCasinoProfiles() {
  // /* This code blanks the profiles!! */
  // profiles = profiles.map(_ => new CasinoProfile());
  // /* Code to blank all profiles ends here!! */

  storeItem('user-profiles', JSON.stringify(profiles));
}
