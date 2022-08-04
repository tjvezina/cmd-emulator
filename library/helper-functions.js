// Wraps p5 event functions if they exist, else defines them
// This avoids the sketch having to forward these functions to other code
function wrapP5Events(target, ...events) {
  events.forEach(eventFunc => {
    if (globalThis[eventFunc] === undefined) {
      globalThis[eventFunc] = target[eventFunc].bind(target);
    } else {
      const prevFunc = globalThis[eventFunc];
      globalThis[eventFunc] = function() {
        target[eventFunc]();
        prevFunc();
      }.bind(target);
    }
  });
}

function toChar(code) { return String.fromCharCode(code); }
function toCode(char) { return char.charCodeAt(0); }