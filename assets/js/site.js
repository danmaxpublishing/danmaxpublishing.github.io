/* DanMaxPublishing site interactions. No dependencies, no external requests. */

/* Once Photo Mode Pro is live, put its Asset Store URL here; every
   [data-store-link] CTA on the site switches to it automatically. */
var STORE_URL = "";

/* Mailing list. Create a Buttondown newsletter, then paste its embed endpoint
   here, e.g. "https://buttondown.com/api/emails/embed-subscribe/danmaxpublishing".
   While this is empty, every notify CTA falls back to the mailto flow. */
var MAILING_LIST_URL = "";

(function () {
  "use strict";

  // Signals CSS that JS is running; reveal-animation styles only apply then,
  // so content is never hidden for no-JS visitors.
  document.documentElement.classList.add("js");

  var root = document.body.getAttribute("data-root") || "./";

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

  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-label", "Image viewer");
    lightbox.innerHTML = '<img alt=""><div class="caption"></div>';
    lightbox.addEventListener("click", function () {
      lightbox.classList.remove("open");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") lightbox.classList.remove("open");
    });
    document.body.appendChild(lightbox);
    return lightbox;
  }

  document.addEventListener("click", function (e) {
    var target = e.target.closest("[data-lightbox]");
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
    lb.classList.add("open");
  });

  /* ---------------- Before/after compare sliders ---------------- */
  document.querySelectorAll(".compare").forEach(function (el) {
    var after = el.querySelector(".after");
    var handle = el.querySelector(".handle");
    if (!after) return;

    function setPos(clientX) {
      var rect = el.getBoundingClientRect();
      var x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
      var pct = (x / rect.width) * 100;
      after.style.width = pct + "%";
      if (handle) {
        handle.style.left = pct + "%";
      }
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
    el.addEventListener("keydown", function (e) {
      var w = parseFloat(after.style.width || "50");
      if (e.key === "ArrowLeft") {
        after.style.width = Math.max(0, w - 4) + "%";
        if (handle) handle.style.left = after.style.width;
        e.preventDefault();
      } else if (e.key === "ArrowRight") {
        after.style.width = Math.min(100, w + 4) + "%";
        if (handle) handle.style.left = after.style.width;
        e.preventDefault();
      }
    });
  });

  /* ---------------- Preset gallery tabs ---------------- */
  document.querySelectorAll("[data-preset-gallery]").forEach(function (gallery) {
    var tabs = gallery.querySelectorAll(".preset-tabs button");
    var img = gallery.querySelector(".preset-stage img");
    if (!tabs.length || !img) return;
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        var src = tab.getAttribute("data-src");
        if (!src || img.getAttribute("src") === src) return;
        if (reducedMotion) {
          img.src = src;
          return;
        }
        img.classList.add("fading");
        var loader = new Image();
        loader.onload = function () {
          img.src = src;
          img.classList.remove("fading");
        };
        loader.src = src;
      });
    });
  });

  /* ---------------- Copy buttons on code blocks ---------------- */
  document.querySelectorAll(".docs-article pre").forEach(function (pre) {
    var btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "Copied!";
        setTimeout(function () {
          btn.textContent = "Copy";
        }, 1600);
      });
    });
    pre.appendChild(btn);
  });

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
  if (searchBox) {
    var resultsEl = document.querySelector(".docs-search .results");
    var index = null;
    var selIdx = -1;

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

    function render(matches) {
      selIdx = -1;
      if (!matches.length) {
        resultsEl.innerHTML = '<div class="none">No results.</div>';
      } else {
        resultsEl.innerHTML = matches
          .slice(0, 9)
          .map(function (m) {
            return (
              '<a href="' + root + m.u + '">' + m.t +
              '<span class="in">' + m.s + "</span></a>"
            );
          })
          .join("");
      }
      resultsEl.classList.add("open");
    }

    searchBox.addEventListener("input", function () {
      var q = searchBox.value.trim().toLowerCase();
      if (q.length < 2) {
        resultsEl.classList.remove("open");
        return;
      }
      loadIndex().then(function (idx) {
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
        if (selIdx >= 0) links[selIdx].classList.remove("sel");
        selIdx = e.key === "ArrowDown"
          ? (selIdx + 1) % links.length
          : (selIdx - 1 + links.length) % links.length;
        links[selIdx].classList.add("sel");
        links[selIdx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && selIdx >= 0) {
        e.preventDefault();
        links[selIdx].click();
      } else if (e.key === "Escape") {
        resultsEl.classList.remove("open");
      }
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".docs-search")) {
        resultsEl.classList.remove("open");
      }
    });
  }

  /* ---------------- Email copy fallback ---------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy-email]");
    if (!btn) return;
    navigator.clipboard.writeText(btn.getAttribute("data-copy-email")).then(function () {
      var original = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1600);
    });
  });

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
    if (reducedMotion) {
      // Reduced motion: nothing moves until the visitor asks it to.
      vids.forEach(function (v) {
        v.removeAttribute("autoplay");
        v.autoplay = false;
        v.controls = true;
        try { v.pause(); } catch (err) { /* not started */ }
      });
    } else if ("IntersectionObserver" in window) {
      // Pause offscreen loops; resume when they scroll back in.
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) {
            if (v.paused) v.play().catch(function () { /* autoplay blocked */ });
          } else if (!v.paused) {
            v.pause();
          }
        });
      }, { threshold: 0.15 });
      vids.forEach(function (v) { vio.observe(v); });
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
    update();
  })();

  /* ---------------- Button press ripple ---------------- */
  if (!reducedMotion) {
    document.addEventListener("pointerdown", function (e) {
      var btn = e.target.closest(".btn");
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
    var card = e.target.closest(".card.hoverable");
    if (!card) return;
    var rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
    card.style.setProperty("--my", (e.clientY - rect.top) + "px");
  }, { passive: true });

  /* ---------------- Ember particles ---------------- */
  (function () {
    if (reducedMotion) return;
    if (navigator.connection && navigator.connection.saveData) return;

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

    function tick() {
      requestAnimationFrame(tick);
      if (document.hidden) return;
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
    tick();
  })();

  /* ---------------- Footer year ---------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
