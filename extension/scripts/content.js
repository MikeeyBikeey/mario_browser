// A canvas container is created to hide any overflow the canvas creates (Godot makes it overflow because it does not take the scrollbars into account)
const canvas_container = document.createElement('div');
const canvas = document.createElement('canvas');

let has_engine_started = false;

function tryInitEngine() {
  if (has_engine_started) {
    return;
  }
  has_engine_started = true;

  // CANVAS

  // Some aspects are based on the Godot source code for html template: "https://github.com/godotengine/godot/blob/master/misc/dist/html/full-size.html"
  const styles = `
  #canvas:focus {
    outline: none;
  }
  `;
  const styleTag = document.createElement('style');
  if (styleTag.styleSheet) {
    styleTag.styleSheet.cssText = styles;
  } else {
    styleTag.appendChild(document.createTextNode(styles));
  }
  document.getElementsByTagName('head')[0].appendChild(styleTag);

  canvas_container.style.overflow = "hidden";
  canvas_container.style.position = "absolute";
  canvas_container.style.left = '0px';
  canvas_container.style.top = '0px';
  canvas_container.style.width = '100%';
  canvas_container.style.height = '100%';
  canvas_container.style.pointerEvents = "none";
  document.body.append(canvas_container);

  canvas.id = "canvas"; // Hopefully the web page doesn't already have an element with the id "canvas"...
  canvas.style.position = "relative"; // "fixed" would normally work, but we want custom scroll-bar-following logic to avoid jittering (look at `game.onscroll`)
  canvas.style.left = '0px';
  canvas.style.top = '0px';
  canvas.style.width = "256px"; // `256px` for no particular reason
  canvas.style.height = "256px"; // `256px` for no particular reason
  canvas.style.display = "block";
  canvas.style.margin = "0";
  canvas.style.color = "white";
  canvas.style.zIndex = "99999"; // `99999` for no particular reason
  function on_focus_lost(e) {
    canvas.focus();
  }
  document.addEventListener('focusout', on_focus_lost);
  canvas_container.append(canvas);

  // GODOT

  const myWasm = chrome.runtime.getURL('scripts/godot');
  const myPck = chrome.runtime.getURL('game.pck');
  const engine = new Engine();
  Promise.all([
    engine.init(myWasm),
    engine.preloadFile(myPck),
  ]).then(() => {
    return engine.start({ "canvas": canvas, "args": ['--main-pack', myPck], "canvasResizePolicy": 2, "experimentalVK": false, "focusCanvas": true, "gdnativeLibs": [] });
  }).then(() => {
    // Engine has started
    canvas.style.position = "relative"; // "fixed" would normally work, but we want custom scroll-bar-following logic to avoid jittering (look at `game.onscroll`)
  });
}

// GAME

// Helper utility for interfacing with Godot.
// Keep this as a `var` so Godot can detect it in the global namespace.
var game = {};

// The current level the player is on.
// Increments by one with each level that is beaten.
game.level = 0;

game.enter_level = function (url) {
  window.location.href = url;
  // chrome.runtime.sendMessage({ name: "open_level", url: url, level: game.level + 1 });
}

game.random_hyper_link = function () {
  const links = document.getElementsByTagName("a");
  const rand_link = links[Math.floor(Math.random() * links.length)];
  const rect = rand_link.getBoundingClientRect();
  return { url: rand_link.href, x: rect.x, y: rect.y };
}

game.platform_inserted_callback = null;
game.set_platform_inserted_callback = function (callback) {
  game.platform_inserted_callback = callback;

  function getBoundingRectangle(node) {
    const range = document.createRange();
    // Selects everything on the inside of the element
    range.setStart(node, 0);
    range.setEndAfter(node);

    return range.getClientRects();
  }

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && window.getComputedStyle(el).visibility !== "hidden";
  }

  let node = null;
  let texts = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  while (node = texts.nextNode()) {
    const rects = getBoundingRectangle(node);
    for (const rect of rects) {
      if (node.parentElement != null && isVisible(node.parentElement)) {
        callback(rect.x + window.scrollX, rect.y + window.scrollY, rect.width, rect.height);
      }
    }
  }

  // const cells = document.getElementsByTagName("p");
  // for (const cell of cells) {
  //   // const rect = cell.getBoundingClientRect();
  //   const rects = getBoundingRectangle(cell);
  //   for (const rect of rects) {
  //     callback(rect.x + window.scrollX, rect.y + window.scrollY, rect.width, rect.height);
  //   }
  // }
};

game.onscroll_callback = null;
game.set_onscroll_callback = function (callback) {
  game.onscroll_callback = callback;
};

game.onscroll = function () {
  canvas_container.style.left = document.documentElement.scrollLeft + 'px';
  canvas_container.style.top = document.documentElement.scrollTop + 'px';
  if (game.onscroll_callback !== null) {
    game.onscroll_callback(document.documentElement.scrollLeft, document.documentElement.scrollTop);
  }
};

// Hopefully modifying `document.body.onscroll` won't lead to any issues with the web page...
document.body.onscroll = game.onscroll;

game.scroll_center_to = function (x, y) {
  window.scrollTo({ left: x - window.innerWidth / 2, top: y - window.innerHeight / 2, behavior: "instant" });
  game.onscroll(); // `onscroll` directly called here because it can take a whole frame for the `window` to notice the change
}

// TODO: Observe changes made to the DOM

// {
//   // Select the node that will be observed for mutations
//   const targetNode = document;

//   // Options for the observer (which mutations to observe)
//   const config = { attributes: true, childList: true, subtree: true };

//   // Callback function to execute when mutations are observed
//   const callback = (mutationList, observer) => {
//     for (const mutation of mutationList) {
//       if (mutation.type === "childList") {
//         console.log("A child node has been added or removed.");
//       } else if (mutation.type === "attributes") {
//         console.log(`The ${mutation.attributeName} attribute was modified.`);
//       }
//     }
//   };

//   var observer = null;

//   // Create an observer instance linked to the callback function
//   observer = new MutationObserver(callback);

//   // Start observing the target node for configured mutations
//   observer.observe(targetNode, config);

//   // // Later, you can stop observing
//   // observer.disconnect();
// }

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.name === "has_engine_started") {
      sendResponse(has_engine_started);
    } else if (request.name === "start_engine") {
      game.level = request.level;
      tryInitEngine();
    }
  }
);
