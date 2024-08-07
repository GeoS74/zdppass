// в контент-скрипте нельзя использовать глобальные переменные!!!
// сервис-воркер может "заснуть" (читай про жизненный цикл сервис-воркера),
// это приводит к потере порта соединения, поэтому для восстановления канала связи 
// сервис-воркер перезапустит контент-скрипт.
// В случае если в контент-скрипте используется глобальная переменная,
// например есть объявление const port = ... 
// то повторный вызов контент-скрипта сервис-воркером приведёт к ошибке декларирования переменной,
// т.к. переменная  const port = ... уже была ранее объявлена.
// Чтобы избежать этой ситуации используется объект chrome в который добавляется кастомный объект
// следующего вида:
//
//   chrome.custom = {
//     port - канал связи с сервис-воркером
//     mutationWindow - объект MutationObserver, наблюдающий за window.document.body
//     mutationPassInput - Map c объектами MutationObserver, наблюдающий за полями ввода пароля
//   }
//
// Прим.: на одной странице может быть несколько форм ввода учётных данных
// Прим.: объект chrome изолирован для каждой вкладки браузера
//
// можно было бы использовать изоляцию контекста выполнения (() => {...})()
// но в этом случае потенциально могут возникнуть проблемы с утечкой памяти

if (!chrome.custom) {
  chrome.custom = {};
}

chrome.custom.port = chrome.runtime.connect({ name: new URL(window.location.href).host });

chrome.custom.port.onMessage.addListener((credentials) => {
  if (chrome.custom.mutationWindow) {
    chrome.custom.mutationWindow.disconnect();
    chrome.custom.mutationWindow = null;
    _clearMutationPassInput();
  }

  if (credentials.hasOwnProperty('error')) {
    return false;
  }

  chrome.custom.mutationWindow = new MutationObserver(() => {
    _credentialsSubstitution(credentials.login, credentials.pass);
  });
  chrome.custom.mutationWindow.observe(window.document.body, {
    attributes: false,
    childList: true,
    subtree: true, // true ???
  });

  _credentialsSubstitution(credentials.login, credentials.pass);
});

function _credentialsSubstitution(login, pass) {
  const passInputs = _findPassInput();

  for (let passInput of passInputs) {
    const loginInput = _findLoginInput(passInput);
    if (!loginInput) {
      continue;
    }

    const event = new Event("input", { bubbles: true });

    loginInput.value = login;
    loginInput.dispatchEvent(event);

    passInput.value = pass;
    passInput.dispatchEvent(event);

    loginInput.setAttribute('readonly', 'true');
    passInput.setAttribute('readonly', 'true');

    const m = new MutationObserver(() => {
      if (passInput.getAttribute('type') === 'password') {
        return;
      }
      passInput.setAttribute('type', 'password');
    });
    m.observe(passInput, {
      attributes: true,
      childList: false,
      subtree: false,
    });

    chrome.custom.mutationPassInput?.get(_generateKeyPassInput(passInput))?.disconnect();
    _addMutationPassInput(passInput, m);
  }
}

function _generateKeyPassInput(passInput) {
  return `pass_${passInput.getAttribute('id') || '_'}${passInput.getAttribute('name') || '_'}`;
}

function _addMutationPassInput(passInput, observer) {
  if (!chrome.custom?.mutationPassInput?.size) {
    chrome.custom.mutationPassInput = new Map();
  }
  chrome.custom.mutationPassInput.set(_generateKeyPassInput(passInput), observer);
}

function _clearMutationPassInput() {
  if (chrome.custom.mutationPassInput?.size) {
    for (const m of chrome.custom.mutationPassInput.values()) {
      m.disconnect();
    }
  }
  chrome.custom.mutationPassInput = new Map();
}

function _findPassInput() {
  return document.querySelectorAll('input[type=password]');
}

function _findLoginInput(e) {
  if (e === window.document.body) {
    return null;
  }
  return e.querySelector('input[type=email]') || e.querySelector('input[type=text]') || _findLoginInput(e.parentNode);
}