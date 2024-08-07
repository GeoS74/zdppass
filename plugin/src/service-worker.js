// const backend = 'http://10.23.20.112:3800/api';
const backend = 'http://192.168.0.121:3800/api';

// клиент при создании соединения прокидывает свойство name 
// в нём записан хост страницы, открытой в браузере
// этот host в сочетании с id вкладки является ключом в коллекции clients
// значениями в clients являются объекты типа:
// {
//   port: ссылка на порт для передачи данных клиенту
//   credentials: объект с логином и паролем
// }
//
// сервис-воркер может "заснуть" (читай про жизненный цикл сервис-воркера),
// это приводит к тому что clients инициируется заново

const clients = new Map();

chrome.runtime.onConnect.addListener(async (port) => {

  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.log('onDisconnect error: ' + chrome.runtime.lastError.message);
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true })
    .then(async res => {
      const [tab] = res;

      // при каждом новом соединении удалить клиента
      clients.delete(port.name + tab.id);

      const credentials = await _getCredentials(port.name);
      _enableSettingsBrowser(!!credentials.error);

      port.postMessage(credentials);

      clients.set(port.name + tab.id, { port, credentials });
    });
});

chrome.tabs.onActivated.addListener(async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // ERROR при создании новой вкадки tab.url может быть пустым
  if (!tab.url) return;

  const host = new URL(tab.url).host;

  if (!clients.has(host + tab.id)) {
    // ошибки могут возникать если адрес вкладки 
    // не соответствует маске "host_permissions" в файле манифеста
    // например вкладка настройки может иметь адрес chrome://settings/
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["./src/index.js"],
    })
      .catch(error => console.log(`error: ${error.message}`));
    return;
  }

  const credentials = await _getCredentials(host);
  _enableSettingsBrowser(!!credentials.error);

  // проверка изменения пароля
  if (!_equalCredentials(clients.get(host + tab.id).credentials, credentials)) {
    clients.get(host + tab.id).credentials = credentials; // обновить логин/пароль
    clients.get(host + tab.id).port.postMessage(credentials);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  // ERROR при создании новой вкадки tab.url может быть пустым
  if (!tab.url) return;

  const host = new URL(tab.url).host;
  // const credentials = clients.get(host + tab.id)?.credentials;
  const credentials = await _getCredentials(host);

  // ошибки могут возникать если адрес вкладки 
  // не соответствует маске "host_permissions" в файле манифеста
  // например вкладка настройки может иметь адрес chrome://settings/
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    // files: ['./src/popup.js'],
    args: [{ credentials }],
    func: async ({ credentials }) => {
      if (credentials.error === 'Failed to fetch') {
        alert('Нет связи с сервером');
        return;
      }

      if (credentials.error) {
        alert('Для этого сайта данных нет');
        return;
      }

      // пример автоматической авторизации
      //
      // if (credentials.hostkey === 'www.dellin.ru') {
      //   const isLogin = confirm('Для этого сайта есть логин/пароль.\nВыполнить вход?');
      //   if (!isLogin) {
      //     return;
      //   }

      //   fetch(`https://www.dellin.ru/auth/login/`, {
      //     method: 'POST',
      //     headers: {
      //       'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      //       'Sec-Fetch-Mode': 'same-origin',
      //       'X-Login': credentials.login,
      //       'X-Password': credentials.pass
      //     },
      //   })
      //     .then(res => {
      //       if (res.ok) {
      //         document.location.reload();
      //         return;
      //       }
      //       throw new Error(res.status)
      //     })
      //     .catch(e => {
      //       console.log('error: ' + e.message);
      //       alert('Ошибка авторизации');
      //     });
      //   return;
      // }

      alert('Для этого сайта есть логин/пароль');
    }
  })
    .catch(error => console.log(`error: ${error.message}`));;
});

function _equalCredentials(c1, c2) {
  return c1.login === c2.login && c1.pass === c2.pass;
}

function _getCredentials(host) {
  return fetch(`${backend}/${host}`)
    .then(async res => {
      if (res.ok) {
        return await res.json();
      }

      throw new Error(`error status ${res.status}`)
    })
    .catch(error => ({
      error: error.message,
    }))
}

function _enableSettingsBrowser(enable) { // true/false
  _enabledPasswordSaving(enable);
  _enabledAutoFill(enable);
}

// запрет автозаполнения
function _enabledAutoFill(enabled) {
  chrome.privacy.services.autofillEnabled.get({}, (details) => {
    if (details.value !== enabled) {

      chrome.privacy.services.autofillEnabled.set({ value: enabled }, () => {
        if (chrome.runtime.lastError !== undefined) {
          console.log("error setting autoFillEnabled: ", chrome.runtime.lastError);
        }
      });
    }
  });
}

// запрет сохранения паролей
function _enabledPasswordSaving(enabled) {
  chrome.privacy.services.passwordSavingEnabled.get({}, (details) => {
    if (details.value !== enabled) {

      chrome.privacy.services.passwordSavingEnabled.set({ value: enabled }, () => {
        if (chrome.runtime.lastError !== undefined) {
          console.log("error setting passwordSavingEnabled: ", chrome.runtime.lastError);
        }
      });
    }
  });
}
