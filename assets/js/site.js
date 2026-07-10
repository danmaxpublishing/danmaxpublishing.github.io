/* DanMaxPublishing site interactions. No dependencies, no external requests. */

/* Once Photo Mode Pro is live, put its Asset Store URL here; every
   [data-store-link] CTA on the site switches to it automatically. */
var STORE_URL = "";

/* Mailing list: the live Buttondown embed endpoint. If it's ever emptied,
   every notify CTA falls back to the mailto flow automatically. */
var MAILING_LIST_URL = "https://buttondown.com/api/emails/embed-subscribe/danmaxpublishing";

(function () {
  "use strict";

  // Signals CSS that JS is running; reveal-animation styles only apply then,
  // so content is never hidden for no-JS visitors.
  document.documentElement.classList.add("js");

  var root = document.body.getAttribute("data-root") || "./";

  /* Delegated handlers receive events whose target may be a non-Element
     (document, text selection edge cases); closest() would throw on those. */
  function closestFrom(target, selector) {
    return target instanceof Element ? target.closest(selector) : null;
  }

  var clipboard = navigator.clipboard || null;

  /* Shared "copy → Copied!" feedback for any copy button. */
  function copyWithFeedback(btn, text, restoreText) {
    clipboard.writeText(text).then(
      function () {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = restoreText;
          btn.classList.remove("copied");
        }, 1600);
      },
      function () {
        btn.textContent = "Copy failed";
        setTimeout(function () {
          btn.textContent = restoreText;
        }, 1600);
      }
    );
  }

  if (STORE_URL) {
    document.querySelectorAll("[data-store-link]").forEach(function (a) {
      a.href = STORE_URL;
      a.rel = "noopener";
      if (/coming soon/i.test(a.textContent)) {
        a.textContent = "Get it on the Asset Store";
      }
    });
  }
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navLinks = document.querySelector(".nav-links");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  var revealables = document.querySelectorAll(".reveal, .reveal-stagger");
  if (revealables.length && "IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealables.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealables.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* ---------------- Lightbox ---------------- */
  var lightbox = null;
  var lightboxOpener = null;

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    if (lightboxOpener && document.contains(lightboxOpener)) {
      lightboxOpener.focus();
    }
    lightboxOpener = null;
  }

  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image viewer");
    lightbox.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close image viewer">×</button>' +
      '<img alt=""><div class="caption"></div>';
    lightbox.addEventListener("click", closeLightbox);
    // The close button is the dialog's only focusable element, so trapping
    // Tab means simply keeping focus on it while the dialog is open.
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        e.preventDefault();
        lightbox.querySelector(".lightbox-close").focus();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
    document.body.appendChild(lightbox);
    return lightbox;
  }

  document.addEventListener("click", function (e) {
    var target = closestFrom(e.target, "[data-lightbox]");
    if (!target) return;
    e.preventDefault();
    var img = target.tagName === "IMG" ? target : target.querySelector("img");
    if (!img) return;
    var lb = ensureLightbox();
    lb.querySelector("img").src = img.currentSrc || img.src;
    lb.querySelector("img").alt = img.alt || "";
    var cap = target.getAttribute("data-caption") || img.alt || "";
    var capEl = lb.querySelector(".caption");
    capEl.textContent = cap;
    capEl.style.display = cap ? "" : "none";
    lightboxOpener = target;
    lb.classList.add("open");
    lb.querySelector(".lightbox-close").focus();
  });

  /* ---------------- Before/after compare sliders ---------------- */
  document.querySelectorAll(".compare").forEach(function (el) {
    var after = el.querySelector(".after");
    var handle = el.querySelector(".handle");
    if (!after) return;

    function setPct(pct) {
      after.style.width = pct + "%";
      if (handle) {
        handle.style.left = pct + "%";
      }
      el.setAttribute("aria-valuenow", String(Math.round(pct)));
    }

    function setPos(clientX) {
      var rect = el.getBoundingClientRect();
      if (!rect.width) return;
      var x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      setPct((x / rect.width) * 100);
    }

    function syncAfterImg() {
      var img = after.querySelector("img");
      if (img) {
        img.style.width = el.getBoundingClientRect().width + "px";
      }
    }

    syncAfterImg();
    window.addEventListener("resize", syncAfterImg);

    el.addEventListener("pointerdown", function (e) {
      setPos(e.clientX);
      try {
        el.setPointerCapture(e.pointerId);
      } catch (err) {
        /* capture is an enhancement; dragging still works via pointermove */
      }
    });
    el.addEventListener("pointermove", function (e) {
      if (e.buttons) setPos(e.clientX);
    });
    // Keyboard accessibility
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "slider");
    el.setAttribute("aria-label", "Before/after comparison");
    el.setAttribute("aria-valuemin", "0");
    el.setAttribute("aria-valuemax", "100");
    el.setAttribute("aria-valuenow", "50");
    el.addEventListener("keydown", function (e) {
      var w = parseFloat(after.style.width || "50");
      var next = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, w - 4);
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(100, w + 4);
      else if (e.key === "PageDown") next = Math.max(0, w - 20);
      else if (e.key === "PageUp") next = Math.min(100, w + 20);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 100;
      if (next !== null) {
        setPct(next);
        e.preventDefault();
      }
    });
  });

  /* ---------------- Preset gallery tabs ---------------- */
  document.querySelectorAll("[data-preset-gallery]").forEach(function (gallery, g) {
    var tabs = Array.prototype.slice.call(
      gallery.querySelectorAll(".preset-tabs button")
    );
    var stage = gallery.querySelector(".preset-stage");
    var img = stage && stage.querySelector("img");
    if (!tabs.length || !img) return;

    // Complete the tab/tabpanel relationship the static markup starts.
    stage.id = stage.id || "preset-stage-" + g;
    stage.setAttribute("role", "tabpanel");
    var loadToken = 0;

    function altFor(tab) {
      return "Demo scene with the " + tab.textContent.trim() + " preset";
    }

    function selectTab(tab, moveFocus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute("aria-selected", selected ? "true" : "false");
        t.tabIndex = selected ? 0 : -1;
      });
      stage.setAttribute("aria-labelledby", tab.id);
      if (moveFocus) tab.focus();
      var src = tab.getAttribute("data-src");
      if (!src || img.getAttribute("src") === src) return;
      var token = ++loadToken; // rapid clicks: only the latest request lands
      if (reducedMotion) {
        img.src = src;
        img.alt = altFor(tab);
        return;
      }
      img.classList.add("fading");
      var loader = new Image();
      loader.onload = function () {
        if (token !== loadToken) return;
        img.src = src;
        img.alt = altFor(tab);
        img.classList.remove("fading");
      };
      loader.src = src;
    }

    tabs.forEach(function (tab, i) {
      tab.id = tab.id || stage.id + "-tab-" + i;
      tab.setAttribute("aria-controls", stage.id);
      var selected = tab.getAttribute("aria-selected") === "true";
      tab.tabIndex = selected ? 0 : -1;
      if (selected) stage.setAttribute("aria-labelledby", tab.id);
      tab.addEventListener("click", function () {
        selectTab(tab, false);
      });
      // Standard tablist keyboard pattern: arrows move and select.
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === "Home") next = tabs[0];
        else if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          selectTab(next, true);
        }
      });
    });
  });

  /* ---------------- Copy buttons on code blocks ---------------- */
  if (clipboard) {
    document.querySelectorAll(".docs-article pre").forEach(function (pre) {
      var btn = document.createElement("button");
      btn.className = "copy-btn";
      btn.type = "button";
      btn.textContent = "Copy";
      btn.addEventListener("click", function () {
        var code = pre.querySelector("code");
        var text = code ? code.innerText : pre.innerText;
        copyWithFeedback(btn, text, "Copy");
      });
      pre.appendChild(btn);
    });
  }

  /* ---------------- Docs TOC scroll spy ---------------- */
  var tocLinks = document.querySelectorAll(".docs-toc a[href^='#']");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var headings = [];
    tocLinks.forEach(function (a) {
      var h = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (h) headings.push({ el: h, link: a });
    });
    var activeLink = null;
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var found = headings.find(function (h) {
            return h.el === entry.target;
          });
          if (!found) return;
          if (activeLink) activeLink.classList.remove("active");
          found.link.classList.add("active");
          activeLink = found.link;
        });
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );
    headings.forEach(function (h) {
      spy.observe(h.el);
    });
  }

  /* ---------------- Docs search ---------------- */
  var searchBox = document.querySelector(".docs-search input");
  var searchResults = document.querySelector(".docs-search .results");
  if (searchBox && searchResults) {
    var resultsEl = searchResults;
    var index = null;
    var selIdx = -1;

    // Combobox wiring so screen readers announce the results list.
    resultsEl.id = resultsEl.id || "docs-search-results";
    searchBox.setAttribute("role", "combobox");
    searchBox.setAttribute("aria-expanded", "false");
    searchBox.setAttribute("aria-autocomplete", "list");
    searchBox.setAttribute("aria-controls", resultsEl.id);

    function setResultsOpen(open) {
      resultsEl.classList.toggle("open", open);
      searchBox.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) {
        selIdx = -1;
        searchBox.removeAttribute("aria-activedescendant");
      }
    }

    function loadIndex() {
      if (index) return Promise.resolve(index);
      return fetch(root + "assets/search-index.json")
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          index = data;
          return index;
        })
        .catch(function () {
          index = [];
          return index;
        });
    }

    function score(entry, terms) {
      var title = entry.t.toLowerCase();
      var body = entry.b.toLowerCase();
      var s = 0;
      for (var i = 0; i < terms.length; i++) {
        var term = terms[i];
        if (!term) continue;
        var inTitle = title.indexOf(term) !== -1;
        var inBody = body.indexOf(term) !== -1;
        if (!inTitle && !inBody) return 0; // all terms must match
        s += inTitle ? 10 : 1;
        if (title === term) s += 15;
      }
      return s;
    }

    // Results are built with createElement/textContent, never innerHTML, so
    // index content can't inject markup.
    function render(matches) {
      selIdx = -1;
      searchBox.removeAttribute("aria-activedescendant");
      resultsEl.textContent = "";
      if (!matches.length) {
        var none = document.createElement("div");
        none.className = "none";
        // A listbox may only contain options; a disabled one carries the
        // "nothing found" message without breaking the pattern.
        none.setAttribute("role", "option");
        none.setAttribute("aria-disabled", "true");
        none.setAttribute("aria-selected", "false");
        none.textContent = "No results.";
        resultsEl.appendChild(none);
      } else {
        matches.slice(0, 9).forEach(function (m, i) {
          var a = document.createElement("a");
          a.href = root + m.u;
          a.id = resultsEl.id + "-" + i;
          a.setAttribute("role", "option");
          a.setAttribute("aria-selected", "false");
          a.appendChild(document.createTextNode(m.t));
          var inEl = document.createElement("span");
          inEl.className = "in";
          inEl.textContent = m.s;
          a.appendChild(inEl);
          resultsEl.appendChild(a);
        });
      }
      setResultsOpen(true);
    }

    searchBox.addEventListener("input", function () {
      var q = searchBox.value.trim().toLowerCase();
      if (q.length < 2) {
        setResultsOpen(false);
        return;
      }
      loadIndex().then(function (idx) {
        if (searchBox.value.trim().toLowerCase() !== q) return; // stale query
        var terms = q.split(/\s+/);
        var matches = idx
          .map(function (entry) {
            return { e: entry, sc: score(entry, terms) };
          })
          .filter(function (x) {
            return x.sc > 0;
          })
          .sort(function (a, b) {
            return b.sc - a.sc;
          })
          .map(function (x) {
            return x.e;
          });
        render(matches);
      });
    });

    searchBox.addEventListener("keydown", function (e) {
      var links = resultsEl.querySelectorAll("a");
      if (!links.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (selIdx >= 0) {
          links[selIdx].classList.remove("sel");
          links[selIdx].setAttribute("aria-selected", "false");
        }
        selIdx = e.key === "ArrowDown"
          ? (selIdx + 1) % links.length
          : (selIdx - 1 + links.length) % links.length;
        links[selIdx].classList.add("sel");
        links[selIdx].setAttribute("aria-selected", "true");
        searchBox.setAttribute("aria-activedescendant", links[selIdx].id);
        links[selIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && selIdx >= 0) {
        e.preventDefault();
        links[selIdx].click();
      } else if (e.key === "Escape") {
        setResultsOpen(false);
      }
    });

    document.addEventListener("click", function (e) {
      if (!closestFrom(e.target, ".docs-search")) {
        setResultsOpen(false);
      }
    });
  }

  /* ---------------- Email copy fallback ---------------- */
  if (clipboard) {
    document.addEventListener("click", function (e) {
      var btn = closestFrom(e.target, "[data-copy-email]");
      if (!btn) return;
      copyWithFeedback(btn, btn.getAttribute("data-copy-email"), "Copy");
    });
  } else {
    // No Clipboard API: the address next to the button is still selectable.
    document.querySelectorAll("[data-copy-email]").forEach(function (btn) {
      btn.hidden = true;
    });
  }

  /* ---------------- Mailing list subscribe forms ---------------- */
  document.querySelectorAll("[data-notify]").forEach(function (box) {
    var form = box.querySelector("form.notify-form");
    var fallback = box.querySelector(".notify-fallback");
    if (!form) return;
    if (MAILING_LIST_URL) {
      form.action = MAILING_LIST_URL;
      form.hidden = false;
      if (fallback) fallback.hidden = true;
    }
  });

  /* ---------------- Showcase videos ---------------- */
  var vids = document.querySelectorAll("video[autoplay]");
  if (vids.length) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reducedMotion || saveData) {
      // Reduced motion / Save-Data: nothing moves (or streams) until asked.
      vids.forEach(function (v) {
        v.removeAttribute("autoplay");
        v.autoplay = false;
        v.controls = true;
        v.preload = "none";
        try { v.pause(); } catch (err) { /* not started */ }
      });
    } else {
      // WCAG 2.2.2: looping animation needs a visible pause control even for
      // visitors without the OS reduced-motion flag.
      vids.forEach(function (v) {
        var frame = v.parentElement;
        if (!frame) return;
        var btn = document.createElement("button");
        btn.className = "vid-toggle";
        btn.type = "button";
        btn.setAttribute("aria-label", "Pause animation");
        btn.textContent = "❚❚";
        btn.addEventListener("click", function () {
          if (v.paused) {
            delete v.dataset.userPaused;
            v.play().catch(function () { /* autoplay blocked */ });
            btn.textContent = "❚❚";
            btn.setAttribute("aria-label", "Pause animation");
          } else {
            v.dataset.userPaused = "1";
            v.pause();
            btn.textContent = "▶";
            btn.setAttribute("aria-label", "Play animation");
          }
        });
        frame.appendChild(btn);
      });
      if ("IntersectionObserver" in window) {
        // Pause offscreen loops; resume when they scroll back in — unless the
        // visitor paused the loop themselves.
        var vio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            var v = en.target;
            if (en.isIntersecting) {
              if (v.paused && !v.dataset.userPaused) {
                v.play().catch(function () { /* autoplay blocked */ });
              }
            } else if (!v.paused) {
              v.pause();
            }
          });
        }, { threshold: 0.15 });
        vids.forEach(function (v) { vio.observe(v); });
      }
    }
  }

  /* ---------------- Scroll progress ---------------- */
  (function () {
    var bar = document.createElement("div");
    bar.className = "fx-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? (window.scrollY / max) * 100 + "%" : "0";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  })();

  /* ---------------- Button press ripple ---------------- */
  if (!reducedMotion) {
    document.addEventListener("pointerdown", function (e) {
      var btn = closestFrom(e.target, ".btn");
      if (!btn) return;
      var rect = btn.getBoundingClientRect();
      var r = document.createElement("span");
      r.className = "fx-ripple";
      r.style.left = (e.clientX - rect.left) + "px";
      r.style.top = (e.clientY - rect.top) + "px";
      btn.appendChild(r);
      r.addEventListener("animationend", function () { r.remove(); });
    });
  }

  /* ---------------- Card cursor glow ---------------- */
  document.addEventListener("pointermove", function (e) {
    var card = closestFrom(e.target, ".card.hoverable");
    if (!card) return;
    var rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
    card.style.setProperty("--my", (e.clientY - rect.top) + "px");
  }, { passive: true });

  /* ---------------- Ember particles ---------------- */
  (function () {
    if (reducedMotion) return;
    if (navigator.connection && navigator.connection.saveData) return;
    // Ambient decoration for the marketing pages only; reading-heavy docs
    // pages shouldn't pay for a persistent full-viewport animation.
    if (document.querySelector(".docs-shell")) return;

    var canvas = document.createElement("canvas");
    canvas.className = "fx-embers";
    canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    var COUNT = window.matchMedia("(max-width: 800px)").matches ? 20 : 44;
    var CYAN = "34, 211, 238";
    var ORANGE = "249, 145, 60";
    var parts = [];
    var sparks = [];

    function reset(p, anywhere) {
      p.x = Math.random() * W;
      p.y = anywhere ? Math.random() * H : H + 8 + Math.random() * 30;
      p.vx = (Math.random() - 0.5) * 0.12;
      p.vy = -(0.16 + Math.random() * 0.38);
      p.r = 0.8 + Math.random() * 1.7;
      p.maxA = 0.12 + Math.random() * 0.26;
      p.a = anywhere ? p.maxA * Math.random() : 0;
      p.tw = Math.random() * 6.28;
      p.col = Math.random() < 0.26 ? CYAN : ORANGE;
      return p;
    }
    for (var i = 0; i < COUNT; i++) parts.push(reset({}, true));

    var scrollDrift = 0;
    var lastScrollY = window.scrollY;
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      scrollDrift += (y - lastScrollY) * 0.03;
      scrollDrift = Math.max(-3, Math.min(3, scrollDrift));
      lastScrollY = y;
    }, { passive: true });

    var px = -1e4, py = -1e4;
    window.addEventListener("pointermove", function (e) {
      px = e.clientX;
      py = e.clientY;
    }, { passive: true });

    window.addEventListener("pointerdown", function (e) {
      // A small ember burst under every press; capped so rapid clicks stay cheap.
      var n = Math.min(10, 60 - sparks.length);
      for (var j = 0; j < n; j++) {
        var ang = Math.random() * 6.28;
        var speed = 0.6 + Math.random() * 1.8;
        sparks.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed - 0.6,
          r: 0.9 + Math.random() * 1.4,
          life: 1,
          col: Math.random() < 0.4 ? CYAN : ORANGE
        });
      }
    }, { passive: true });

    var rafId = null;

    function tick() {
      rafId = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, W, H);
      scrollDrift *= 0.9;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.tw += 0.028;
        p.x += p.vx + Math.sin(p.tw) * 0.07;
        p.y += p.vy + scrollDrift;
        if (p.a < p.maxA) p.a += 0.004;

        // Gentle push away from the pointer.
        var dx = p.x - px, dy = p.y - py;
        var d2 = dx * dx + dy * dy;
        if (d2 < 8100 && d2 > 1) {
          var f = 0.35 / Math.sqrt(d2);
          p.x += dx * f;
          p.y += dy * f;
        }

        if (p.y < -12 || p.x < -12 || p.x > W + 12) reset(p, false);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fillStyle = "rgba(" + p.col + "," + p.a.toFixed(3) + ")";
        ctx.fill();
      }

      for (var s = sparks.length - 1; s >= 0; s--) {
        var k = sparks[s];
        k.life -= 0.025;
        if (k.life <= 0) { sparks.splice(s, 1); continue; }
        k.vy += 0.03;
        k.x += k.vx;
        k.y += k.vy;
        ctx.beginPath();
        ctx.arc(k.x, k.y, k.r * k.life, 0, 6.28);
        ctx.fillStyle = "rgba(" + k.col + "," + (0.5 * k.life).toFixed(3) + ")";
        ctx.fill();
      }
    }

    // Stop scheduling frames entirely while the tab is hidden.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      } else if (rafId === null) {
        tick();
      }
    });
    tick();
  })();

  /* ---------------- Footer year ---------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
