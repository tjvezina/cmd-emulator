class BGMusic {
  static playbackHandler;

  static playSong(fileName, loop = true) {
    this.stop();

    loadStrings(`assets/${fileName}.mus`, result => {
      const beepNotes = result.map(line => {
        const [note, octave, length] = line.split(/\s/).filter(x => x.length > 0);
        return { length, frequency: this.#getFreq(note, Number(octave)) };
      });

      this.stop();
      this.playbackHandler = { isStopped: false };
      this.#play(beepNotes, loop, this.playbackHandler);
    });
  }

  static stop() {
    if (this.playbackHandler !== undefined) {
      this.playbackHandler.isStopped = true;
      this.playbackHandler = undefined;
    }
  }

  static #getFreq(note, octave) {
    let index;

    switch (note) {
      case 'C': index = 0; break;
      case 'C#':
      case 'Db': index = 1; break;
      case 'D': index = 2; break;
      case 'D#':
      case 'Eb': index = 3; break;
      case 'E': index = 4; break;
      case 'F': index = 5; break;
      case 'F#':
      case 'Gb': index = 6; break;
      case 'G': index = 7; break;
      case 'G#':
      case 'Ab': index = 8; break;
      case 'A': index = 9; break;
      case 'A#':
      case 'Bb': index = 10; break;
      case 'B': index = 11; break;
      default:
        return 0;
    }

    index -= 9; // Relative to A4

    return 440 * pow(2, index/12 + octave);
  }

  static async #play(beepNotes, loop, playbackHandler) {
    const osc = new p5.Oscillator();
    let noteIndex = 0;

    while (noteIndex < beepNotes.length && !playbackHandler.isStopped) {
      const note = beepNotes[noteIndex];

      /*
        JS PORT NOTE: The original code seemed to `Sleep()` for 1.5x the note length, to add extra space between
        notes and prevent audio skipping; however, the `Beep()` used to play the notes is synchronous, so there was
        actually a break 2.5x the note length between notes; this way the original music files sound the same here.
      */
      const length = note.length * 2.5;
      osc.freq(note.frequency);

      // Ramp the volume up at the start and down at the end, to soften the tone
      osc.amp(0);
      osc.amp(0.1, 0.01);
      osc.amp(0, 0.01, (length/1000)-0.01);

      osc.start();
      await sleep(length);
      osc.stop();
    
      ++noteIndex;
      if (loop && noteIndex === beepNotes.length) {
        noteIndex = 0;
      }
    }

    playbackHandler.isStopped = true;
  }
}