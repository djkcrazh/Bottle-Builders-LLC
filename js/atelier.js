/* ==========================================================================
   ATELIER behaviour
   Mounts the grid and adds the motion the theme depends on. Loaded on every
   sheet, after site.js. Like motion.css this layer is additive: remove it and
   the site still works, just stiller.
   ========================================================================== */

(function () {
  "use strict";

  var canvas = document.getElementById("grid");
  if (canvas && window.KineticGrid) KineticGrid.mount(canvas);

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* There is deliberately no scroll-scale on .elevation-frame here. It holds a
     photographic plate, and a transform promotes it to its own compositing
     layer where the filtered image can fail to paint. motion.css gives that
     element box-shadow transitions only, for exactly this reason. Do not add
     one back. */

  /* --- Glass cards tilt toward the pointer ------------------------------ */

  /* Only cards with no photograph inside. A transform on a card holding a
     cyanotype plate promotes it to its own compositing layer and the filtered
     image never paints, which is why .member and .bcard are absent here. */
  var tilt = document.querySelectorAll(".process-step, .stat, .card, .jrn-product");
  [].forEach.call(tilt, function (c) {
    c.addEventListener("mousemove", function (e) {
      var r = c.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      /* Capped at 4 degrees. Past that the text starts to look like it is
         sliding off the card. */
      c.style.transform =
        "perspective(800px) rotateX(" + (-py * 4).toFixed(2) + "deg) " +
        "rotateY(" + (px * 4).toFixed(2) + "deg) translateY(-6px)";
    });
    c.addEventListener("mouseleave", function () { c.style.transform = ""; });
  });

  /* --- The character idles ---------------------------------------------- */

  var mascot = document.querySelector(".hero-mascot");
  if (mascot) {
    var t0 = performance.now();
    (function bob(now) {
      var k = (now - t0) / 1000;
      mascot.style.transform =
        "translateY(" + (Math.sin(k * 1.4) * 7).toFixed(2) + "px) " +
        "rotate(" + (Math.sin(k * 0.9) * 2.2).toFixed(2) + "deg)";
      requestAnimationFrame(bob);
    })(t0);
  }
})();
