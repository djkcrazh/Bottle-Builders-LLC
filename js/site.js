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

  /* --- The journey: stage each fork as it is reached ---------------------- */

  var phases = document.querySelectorAll("[data-phase]");

  if (phases.length) {
    var jrnEnd = document.getElementById("jrn-end");

    if (!("IntersectionObserver" in window) || reduced) {
      Array.prototype.forEach.call(phases, function (p) { p.classList.add("is-live"); });
      if (jrnEnd) jrnEnd.classList.add("is-live");
    } else {
      // Fires once the fork is properly in view, not the instant it clips the
      // bottom edge, so the sequence is never half watched.
      var stager = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-live");
          stager.unobserve(entry.target);
        });
      }, { threshold: 0.2, rootMargin: "0px 0px -12% 0px" });

      Array.prototype.forEach.call(phases, function (p) { stager.observe(p); });

      if (jrnEnd) {
        var endObs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-live");
            endObs.unobserve(entry.target);
          });
        }, { threshold: 0.3 });
        endObs.observe(jrnEnd);
      }
    }

    /* The bottle rides the spine ------------------------------------------ */

    var run = document.querySelector(".jrn-run");
    var track = document.querySelector(".jrn-track i");
    var rider = document.querySelector(".jrn-rider");
    var impact = document.querySelector(".jrn-impact");
    var riding = false;

    if (run && track && rider) {
      var lastNode = -1;

      var ride = function () {
        var box = run.getBoundingClientRect();
        var topDoc = box.top + window.scrollY;
        var height = box.height;

        // The bottle sits where the reader is looking, so descending the page
        // and descending the spine are the same motion.
        var anchor = window.scrollY + window.innerHeight * 0.5;
        var p = (anchor - topDoc) / height;
        p = Math.max(0, Math.min(1, p));

        track.style.height = (p * 100).toFixed(2) + "%";
        rider.style.top = (p * height).toFixed(1) + "px";

        if (p > 0.001 && p < 0.999) {
          rider.classList.add("is-riding");
          riding = true;
        } else if (p >= 0.999) {
          rider.classList.add("is-riding");
        } else {
          rider.classList.remove("is-riding");
        }

        // A small hop each time it passes a fork, so the forks register as
        // events rather than as scenery.
        var node = Math.floor(p * 3);
        if (riding && node !== lastNode && node > 0 && node < 3) {
          rider.classList.remove("is-hopping");
          void rider.offsetWidth;
          rider.classList.add("is-hopping");
        }
        lastNode = node;
      };

      if (reduced) {
        track.style.height = "100%";
        rider.classList.add("is-riding");
      } else {
        var riderTicking = false;
        var onRide = function () {
          if (riderTicking) return;
          riderTicking = true;
          window.requestAnimationFrame(function () { ride(); riderTicking = false; });
        };
        window.addEventListener("scroll", onRide, { passive: true });
        window.addEventListener("resize", onRide, { passive: true });
        ride();
      }
    }

    /* Travel to a fork. On touch this is the whole interaction, since there
       is no hover to lean on. */
    Array.prototype.forEach.call(document.querySelectorAll("[data-next]"), function (link) {
      link.addEventListener("click", function (e) {
        var target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        e.preventDefault();

        var top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
        target.classList.add("is-live");

        // Only the opening call to action launches the bottle. Between forks
        // the rider is already on the spine and simply carries on.
        if (reduced || !run || !rider || link.getAttribute("href") !== "#journey") return;

        var from = link.getBoundingClientRect();
        var runBox = run.getBoundingClientRect();
        var landX = runBox.left + (window.innerWidth > 860 ? runBox.width / 2 : 17);
        var landY = runBox.top + window.scrollY - top; // where the spine starts once scrolled

        var flyer = document.createElement("img");
        flyer.className = "jrn-flyer";
        flyer.src = rider.getAttribute("src");
        flyer.alt = "";
        flyer.setAttribute("aria-hidden", "true");
        flyer.style.left = (from.left + from.width / 2 - 27) + "px";
        flyer.style.top = (from.top + from.height / 2 - 27) + "px";
        document.body.appendChild(flyer);

        var dx = landX - (from.left + from.width / 2);
        var dy = landY - (from.top + from.height / 2);

        var flight = flyer.animate([
          { transform: "translate(0,0) rotate(-10deg) scale(0.85)", opacity: 0 },
          { transform: "translate(" + (dx * 0.45) + "px," + (dy * 0.3) + "px) rotate(8deg) scale(1.12)", opacity: 1, offset: 0.45 },
          { transform: "translate(" + dx + "px," + dy + "px) rotate(0deg) scale(1)", opacity: 1 }
        ], { duration: 950, easing: "cubic-bezier(0.45, 0, 0.2, 1)", fill: "forwards" });

        flight.onfinish = function () {
          flyer.remove();
          rider.classList.add("is-riding", "is-hopping");
          if (impact) {
            impact.style.top = rider.style.top || "0px";
            impact.classList.remove("is-hit");
            void impact.offsetWidth;
            impact.classList.add("is-hit");
          }
        };
      });
    });
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
