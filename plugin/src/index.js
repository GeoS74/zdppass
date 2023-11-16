// https://developer.chrome.com/docs/extensions/reference/runtime/
// https://developer.chrome.com/docs/extensions/mv3/messaging/


function findLoginInput(e) {
  if(e == window.document.body) {
    return null;
  }

  return e.querySelector('input[type=email]') || e.querySelector('input[type=text]') || foo(e.parentNode);
}

const host = new URL(window.location.href).host;


var port = chrome.runtime.connect({name: "knockknock"});

port.postMessage({joke: "Knock knock"});

port.onMessage.addListener(function(msg) {
  console.log(msg);
  
  
});






// fetch(`https://sgn74.ru`, { mode: 'no-cors'})
// fetch(`http://31.129.96.15:3800/api/${host}`)
//   .then(async res => {
//     if(res.ok) {
//       window.console.log(await res.text())
//       return;
//     }

//     throw new Error(`error status ${res.status}`)
//   })
//   .catch(error => {
//     window.console.log(error.message)
//   })



// chrome.runtime.sendMessage(
//   {
//       contentScriptQuery: "getData"
//       , url: `http://31.129.96.15:3800/api/`
//   }, function (response) {
//     window.console.log(response)
//       // debugger;
//       if (response != undefined && response != "") {
//           // callback(response);
//       }
//       else {
//           // debugger;
//           // callback(null);
//       }
//   });















// function searchPass() {
//   const passInput = document.querySelector('input[type=password]');

//   if(passInput) {

//     const inputLogin = foo(passInput);
//     window.console.log(passInput);
//     window.console.log(inputLogin);
//     // for(let e of inputs) {
//     //   document.console.log(e);
//     // }

//     inputLogin.setAttribute('disabled', true);
//     passInput.setAttribute('disabled', true);

//     inputLogin.value="this is ypu login"
//     passInput.value="bla bla bla"

//   }
// }

// function foo(e) {
//   if(e == window.document.body) {
//     return null;
//   }

//   return e.querySelector('input[type=email]') || e.querySelector('input[type=text]') || foo(e.parentNode);
// }


// new MutationObserver(mutations => searchPass())
//   .observe(window.document.body, {
//     attributes: false,
//     childList: true,
//     subtree: false,
//   });











// const article = document.querySelector("h1");

// // `document.querySelector` may return null if the selector doesn't match anything.
// if (article) {
//   const text = article.textContent;
//   const wordMatchRegExp = /[^\s]+/g; // Regular expression
//   const words = text.matchAll(wordMatchRegExp);
//   // matchAll returns an iterator, convert to array to get word count
//   const wordCount = [...words].length;
//   const readingTime = Math.round(wordCount / 200);
//   const badge = document.createElement("p");
//   // Use the same styling as the publish information in an article's header
//   badge.classList.add("color-secondary-text", "type--caption");
//   badge.textContent = `⏱️ ${readingTime} min read`;

//   // Support for API reference docs
//   // const heading = article.querySelector("h1");
//   // Support for article docs with date
//   // const date = article.querySelector("time")?.parentNode;

//   (article).insertAdjacentElement("afterend", badge);
// }

// window.console.log(window.location);
// window.console.log(window.navigator);

// const old = window.location.href;
// const observer = new MutationObserver(mutations => {
//   if (old !== window.location.href) {
//     window.alert()
//   }
// });

// observer.observe(window.document.body, {
//   attributes: true,
//   childList: true,
//   subtree: true,
//   characterData: true
// })
