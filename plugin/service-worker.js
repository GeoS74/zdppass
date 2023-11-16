// fetch(`http://31.129.96.15:3800/api/sgn74.ru`)
//   .then(async res => {
//     if(res.ok) {
//       console.log(await res.text())
//       return;
//     }

//     throw new Error(`error status ${res.status}`)
//   })
//   .catch(error => {
//     console.log(error.message)
//   })

  chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === "knockknock");

    port.onMessage.addListener(function(msg) {
      
      fetch(`http://31.129.96.15:3800/api/sgn74.ru`)
      .then(async res => {
        if(res.ok) {
          const result = await res.text();
          port.postMessage({question: result});
          return;
        }

        throw new Error(`error status ${res.status}`)
      })
      .catch(error => {
        port.postMessage({question: error.message});
        console.log(error.message)
      })


       
    });
  });