const backend = 'http://31.129.96.15:3800/api';

function _getCredentials(host) {
  return fetch(`${backend}/${host}`)
  .then(async res => {
    if(res.ok) {
      return await res.json();
    }

    throw new Error(`error status ${res.status}`)
  })
  .catch(error => {
    console.log(`error: ${error.message}`);
    return {
      error: error.message,
    }
  })
}

chrome.runtime.onConnect.addListener(async (port) => {
  const credentials = await _getCredentials(port.name);
  port.postMessage(credentials);
});
