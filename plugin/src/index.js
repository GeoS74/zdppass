let host = new URL(window.location.href).host;

const port = chrome.runtime.connect({ name: host });

let mutationWindow;
let mutationPassInput;

port.onMessage.addListener((credentials) => {
  if (mutationWindow) {
    mutationWindow.disconnect();
    mutationWindow = null;
    mutationPassInput.disconnect();
    mutationPassInput = null;
  }

  if (credentials.hasOwnProperty('error')) {
    return false;
  }

  mutationWindow = new MutationObserver(() => {
    _credentialsSubstitution(credentials.login, credentials.pass);
  })
    .observe(window.document.body, {
      attributes: false,
      childList: true,
      subtree: true,
    });

  _credentialsSubstitution(credentials.login, credentials.pass);
});

function _credentialsSubstitution(login, pass) {
  const passInput = _findPassInput();
  if (!passInput) {
    return;
  }

  const loginInput = _findLoginInput(passInput)

  if (!loginInput) {
    return;
  }

  loginInput.setAttribute('readonly', 'true');
  passInput.setAttribute('readonly', 'true');

  loginInput.value = login;
  passInput.value = pass;

  if (mutationPassInput) {
    mutationPassInput.disconnect();
    mutationPassInput = null;
  }

  mutationPassInput = new MutationObserver(() => {
    loginInput.value = login;
    passInput.value = pass;

    if (passInput.getAttribute('type') === 'password') {
      return;
    }
    passInput.setAttribute('type', 'password');
  })
    .observe(passInput, {
      attributes: true,
      childList: false,
      subtree: false,
    });
}

function _findPassInput() {
  return document.querySelector('input[type=password]');
}

function _findLoginInput(e) {
  if (e === window.document.body) {
    return null;
  }
  return e.querySelector('input[type=email]') || e.querySelector('input[type=text]') || _findLoginInput(e.parentNode);
}