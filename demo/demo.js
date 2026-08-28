/* WebGL demo bootstrap. Kept out of the page so the site CSP can stay
   script-src 'self' with no inline execution. */

(function () {
  "use strict";

  var canvas = document.getElementById("unity-canvas");
  var loading = document.getElementById("demo-loading");
  var progress = document.getElementById("demo-progress");
  var status = document.getElementById("demo-status");
  var fsBtn = document.getElementById("btn-fullscreen");

  function fail(message) {
    if (progress.parentElement) progress.parentElement.style.display = "none";
    status.className = "demo-error";
    // The loader can reject with an Error object rather than a string;
    // concatenating that directly would print "[object Object]".
    var text = message && message.message ? message.message : String(message);
    status.textContent = "The demo could not start: " + text +
      ". Try desktop Chrome, Edge or Firefox with WebGL 2 enabled.";
  }

  // The loader script is a separate request; if it failed (offline, blocked),
  // createUnityInstance never exists and the page would otherwise hang on
  // "Loading…" forever.
  if (typeof createUnityInstance !== "function") {
    fail("the engine loader did not load");
    return;
  }

  createUnityInstance(canvas, {
    arguments: [],
    dataUrl: "./Build/WebGLDemo.data.unityweb",
    frameworkUrl: "./Build/WebGLDemo.framework.js.unityweb",
    codeUrl: "./Build/WebGLDemo.wasm.unityweb",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "DanMaxPublishing",
    productName: "Photo Mode Pro Demo",
    productVersion: "1.1.1",
    // Post-startup loader faults (WebGL context lost, memory growth failure)
    // are reported through this banner; without it they go only to the
    // console and the canvas just freezes with no on-page message.
    showBanner: function (message, type) {
      if (type === "error") {
        fail(message);
      }
    }
  }, function (p) {
    progress.style.width = (p * 100) + "%";
    if (p >= 0.9) {
      status.textContent = "Warming up the engine…";
    }
  }).then(function (instance) {
    loading.style.display = "none";
    fsBtn.disabled = false;
    fsBtn.addEventListener("click", function () {
      instance.SetFullscreen(1);
    });
  }).catch(function (message) {
    fail(message);
  });
})();
