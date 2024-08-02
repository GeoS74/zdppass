// const backend = 'http://10.23.20.112:3800/api';
const backend = 'http://127.0.0.1:3800/api';

// https://developer.chrome.com/docs/extensions/reference/api/tabs?hl=ru
// async function getCurrentTab() {
//   let queryOptions = { active: true, lastFocusedWindow: true };
//   // `tab` will either be a `tabs.Tab` instance or `undefined`.
//   let [tab] = await chrome.tabs.query(queryOptions);
//   return tab;
// }

let port;

chrome.runtime.onConnect.addListener(async (p) => {
  port = p;

  const credentials = await _getCredentials(port.name);
  _changerSettingsBrowser(credentials);
  port.postMessage(credentials);
});

chrome.tabs.onActivated.addListener(async () => {
  if(!port) {
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  // new URL может выбросить исключение
  try {
    const host = new URL(tab.url).host;
    const credentials = await _getCredentials(host);

    _changerSettingsBrowser(credentials);

    port.postMessage(credentials);
  }
  catch (error) {
    console.log(`error: ${error.message}`)
  }
});

function _changerSettingsBrowser(credentials) {
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
