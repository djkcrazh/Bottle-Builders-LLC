/* ==========================================================================
   BOTTLE BUILDERS - Sheet behaviour
   Loading sheet, navigation, scroll reveal, count-up, scroll position.
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Loading sheet ----------------------------------------------------- */

  var loader = document.getElementById("loader");
  if (loader) {
    // Give the drawn-in sequence time to play once, then never again this visit.
    var seen = sessionStorage.getItem("bb-sheet-drawn") === "1";
    var hold = seen || reduced ? 0 : 2100;

    var dismiss = function () {
      loader.classList.add("done");
      sessionStorage.setItem("bb-sheet-drawn", "1");
      window.setTimeout(function () {
        if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
      }, 700);
    };

    if (hold === 0) {
      dismiss();
    } else {
      window.addEventListener("load", function () {
        window.setTimeout(dismiss, hold);
      });
      // Never strand the visitor behind the sheet if something stalls.
      window.setTimeout(dismiss, hold + 2600);
    }
  }

  /* --- Navigation -------------------------------------------------------- */

  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* --- Scroll reveal ----------------------------------------------------- */

  var revealables = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || reduced) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("in"); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
        window.setTimeout(function () { el.classList.add("in"); }, delay);
        revealer.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

    Array.prototype.forEach.call(revealables, function (el) { revealer.observe(el); });
  }

  /* --- Photographic plates finish building when they come into view ------- */

  var autoPlates = document.querySelectorAll(".plate[data-autobuild]");
  if (autoPlates.length && "IntersectionObserver" in window) {
    var builder = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var plate = entry.target;
        builder.unobserve(plate);
        // Hold on the cyanotype for a beat so the change from drawn to built
        // is something you watch happen, not something already finished.
        window.setTimeout(function () { plate.classList.add("is-built"); }, reduced ? 0 : 850);
      });
    }, { threshold: 0.45 });
    Array.prototype.forEach.call(autoPlates, function (el) { builder.observe(el); });
  }

  /* --- Count-up on the traction figures ---------------------------------- */

  var counters = document.querySelectorAll("[data-count]");

  var runCount = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var group = el.getAttribute("data-group") === "true";
    var duration = 1250;
    var start = null;

    var format = function (v) {
      var n = Math.round(v);
      return group ? n.toLocaleString("en-US") : String(n);
    };

    if (reduced) { el.textContent = format(target) + suffix; return; }

    var tick = function (now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  };

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(counters, runCount);
    } else {
      var counterObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          counterObs.unobserve(entry.target);
        });
      }, { threshold: 0.6 });
      Array.prototype.forEach.call(counters, function (el) { counterObs.observe(el); });
    }
  }

  /* --- Scroll position, drawn down the left edge of the sheet ------------- */

  var progress = document.querySelector(".progress");
  if (progress) {
    var bar = progress.querySelector("i");
    var readout = progress.querySelector("span");
    var ticking = false;

    var drawProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.height = (pct * 100).toFixed(1) + "%";
      if (readout) readout.textContent = Math.round(pct * 100) + "% of sheet";
      ticking = false;
    };

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(drawProgress);
    }, { passive: true });

    window.addEventListener("resize", drawProgress, { passive: true });
    drawProgress();
  }

  /* --- Title block gets out of the way while scrolling -------------------- */

  var titleblock = document.querySelector(".titleblock");
  if (titleblock) {
    var restTimer = null;
    window.addEventListener("scroll", function () {
      titleblock.classList.add("away");
      window.clearTimeout(restTimer);
      restTimer = window.setTimeout(function () {
        titleblock.classList.remove("away");
      }, 380);
    }, { passive: true });
  }

  /* --- Year in the title block ------------------------------------------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
