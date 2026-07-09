/* DanMaxPublishing site interactions — no dependencies, no external requests. */
(function () {
  "use strict";

  var root = document.body.getAttribute("data-root") || "./";
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

  /* ---------------- Footer year ---------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
})();
