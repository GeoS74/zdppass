// const backend = 'http://10.23.20.112:3800/api';
const backend = 'http://127.0.0.1:3800/api';

// https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ru
// async function getCurrentTab() {
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }


// let PORT;
const clients = new Map();

chrome.runtime.onConnect.addListener(async (port) => {
  console.log(`onConnect`);
  // console.log(p);

  // PORT = p;

  console.log(`добавляем клиента`);
  clients.delete(port.name);
   
  const credentials = await _getCredentials(port.name,);
  _changeSettingsBrowser(credentials);
  port.postMessage(credentials);

  clients.set(port.name, {port, credentials});
});

chrome.tabs.onActivated.addListener(async () => {
  console.log(`onActivated`);
  
   try{
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // console.log(tab);

    const host = new URL(tab.url).host;

    if(!clients.has(host)) {
      console.log(`перевызываем клиента`);
      await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["src/index.js"],
      });
      return;
    }

    console.log(`такой клиент уже есть`);

    const credentials = await _getCredentials(host);
    // console.log(credentials);
    _changeSettingsBrowser(credentials);

    // console.log(clients.get(host).credentials.login);
    // console.log(credentials.login);
    // console.log(clients.get(host).credentials.pass);
    // console.log(credentials.pass);
    // console.log('````````````````````');

    if(!_equalCredentials(clients.get(host).credentials, credentials)) {
      console.log(`данные изменены`);
      clients.get(host).credentials = credentials;
      clients.get(host).port.postMessage(credentials);
    }
     
    
   }
   catch(error) {
    console.log(`error activate ${error.message}`)
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
    .catch(error => {
      return {
        error: error.message,
      }
    })
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
  chrome.privacy.services.autofillEnabled.get({}, function (details) {
    if (details.value !== enabled) {

      chrome.privacy.services.autofillEnabled.set({ value: enabled }, function () {
        if (chrome.runtime.lastError !== undefined) {
          console.log("error setting autoFillEnabled: ", chrome.runtime.lastError);
        }
      });
    }
  });
}

// запрет сохранения паролей
function _enabledPasswordSaving(enabled) {
  chrome.privacy.services.passwordSavingEnabled.get({}, function (details) {
    if (details.value !== enabled) {

      chrome.privacy.services.passwordSavingEnabled.set({ value: enabled }, function () {
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
