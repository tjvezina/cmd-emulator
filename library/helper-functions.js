// Wraps p5 event functions if they exist, else defines them
// This avoids the sketch having to forward these functions to other code
function wrapP5Events(target, ...events) {
  events.forEach(event => {
    const eventFunc = globalThis[event];

    globalThis[event] = (eventFunc === undefined
      ? target[event].bind(target)
      : function() {
          target[event]();
          eventFunc();
        }
    );
  });
}

function toChar(code) { return String.fromCharCode(code); }
function toCode(char) { return char.charCodeAt(0); }

async function sha256(message) {
  if (typeof message !== 'string' || message.length === 0) {
    return '';
  }

  const messageBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', messageBuffer);
  const hashBytes = Array.from(new Uint8Array(hashBuffer));

  return hashBytes.map(byte => byte.toString(16).padStart(2, '0')).join('');
}