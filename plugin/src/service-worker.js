// const backend = 'http://10.23.20.112:3800/api';
const backend = 'http://127.0.0.1:3800/api';

// лиент при создании соединения прокидывает свойство name 
// в нём записан хост страницы, открытой в браузере
// этот host является ключом в коллекции clients
// значениями в clients являются объекты типа:
// {
//   port: ссылка на порт для передачи данных клиенту
//   credentials: объект с логином и паролем
// }
const clients = new Map();

chrome.runtime.onConnect.addListener(async (port) => {
  // при каждом новом соединении удалить клиента
  clients.delete(port.name);
   
  const credentials = await _getCredentials(port.name,);
  _changeSettingsBrowser(credentials);
  port.postMessage(credentials);

  clients.set(port.name, {port, credentials});
});

chrome.tabs.onActivated.addListener(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const host = new URL(tab.url).host;

    if(!clients.has(host)) {
      // ошибки могут возникать если адрес вкладки 
      // не соответствует маске "host_permissions" в файле манифеста
      // например вкладка настройки может иметь адрес chrome://settings/
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["src/index.js"],
      })
      .catch(error => console.log(`error: ${error.message}`));
      return;
    }

    const credentials = await _getCredentials(host);
    _changeSettingsBrowser(credentials);

    if(!_equalCredentials(clients.get(host).credentials, credentials)) {
      clients.get(host).credentials = credentials; // обновить логин/пароль
      clients.get(host).port.postMessage(credentials);
    }
});

function _equalCredentials(c1, c2) {
  return c1.login === c2.login && c1.pass === c2.pass;
}

function _changeSettingsBrowser(credentials) {
  if (!credentials.error) {
    _enabledPasswordSaving(false);
    _enabledAutoFill(false);
  } else {
    _enabledPasswordSaving(true);
    _enabledAutoFill(true);
  }
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

// удаляет все пароли сохранённые за последние 10 лет
// function _removePasswords(){
//   const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 365 * 10;
//     chrome.browsingData.removePasswords({
//       "since": (new Date()).getTime() - millisecondsPerWeek
//     }, () => {
//       console.log('clean password')
//     });
// }

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

// контроль изменений состояний
// chrome.privacy.services.passwordSavingEnabled.onChange.addListener(
//   function (details) {
//     console.log('toggle')
//     console.log(details.value);
//   }
// );
