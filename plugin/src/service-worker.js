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
  console.log('onConnect');

  chrome.tabs.query({ active: true, currentWindow: true })
  .then (async res => {
    const [tab] = res;

    console.log(port.name+tab.id);
    // при каждом новом соединении удалить клиента
    clients.delete(port.name+tab.id);
    
    const credentials = await _getCredentials(port.name);
    _enableSettingsBrowser(!!credentials.error);
    
    port.postMessage(credentials);

    // if(clients.get(port.name+tab.id)) {
    //   await clients.get(port.name+tab.id).port.disconnect();
    // }

    clients.set(port.name+tab.id, {port, credentials});
  });
});

chrome.tabs.onActivated.addListener(async () => {
  console.log('onActivated');

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // ERROR при создании новой вкадки
    const host = new URL(tab.url).host;

    if(!clients.has(host+tab.id)) {
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

    console.log('old tabs');
    const credentials = await _getCredentials(host);
    _enableSettingsBrowser(!!credentials.error);

    if(!_equalCredentials(clients.get(host+tab.id).credentials, credentials)) {
      clients.get(host+tab.id).credentials = credentials; // обновить логин/пароль
      clients.get(host+tab.id).port.postMessage(credentials);
    }
});

function _equalCredentials(c1, c2) {
  return c1.login === c2.login && c1.pass === c2.pass;
}

function _enableSettingsBrowser(enable) { // true/false
  _enabledPasswordSaving(enable);
  _enabledAutoFill(enable);
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
