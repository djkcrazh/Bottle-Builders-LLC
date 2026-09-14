/* ==========================================================================
   KINETIC GRID - white + blue
   Vanilla port of the 21st.dev React component, recoloured for the cyanotype
   palette: navy linework on white paper instead of white on black.

   The grid leans away from the pointer, ripples on click, and lights its
   nearest nodes hardhat yellow. No dependencies and no build step, which is
   the point: this site has neither and is not getting either.

   The pointer warp is deliberately tiny (maxWarp 4, not the 30 the source
   component shipped). At the larger values the webbing dragged behind the
   cursor and competed with the copy for attention. The click ripple is the
   reaction; this is only the ambient lean underneath it.

   Usage:  KineticGrid.mount(canvasEl)
   ========================================================================== */

(function (global) {
  "use strict";

  // One preset, kept as a table so the numbers are named and tunable in one
  // place rather than scattered through the draw loop.
  var PRESETS = {
    atelier: {
      cell: 88,
      influence: 210,
      /* The source component shipped 30, which dragged the webbing behind the
         cursor and competed with the copy. 9 fixed that; 4 is the second pass,
         and is about as far as this can go before the grid stops answering the
         pointer at all. The click ripple carries the reaction now; this is
         only the ambient lean underneath it. */
      maxWarp: 4,
      dotSpacing: 44,
      lineBase:   { r: 13,  g: 46,  b: 76,  a: 0.07 },
      lineActive: { r: 21,  g: 100, b: 200, a: 0.20 },
      nodeBase:   { r: 13,  g: 46,  b: 76,  a: 0.10 },
      nodeActive: { r: 245, g: 180, b: 23,  a: 0.55 },
      glow: "245,180,23",
      glowMax: 0.09,
      ripple: "40,120,220",
      dot: "rgba(13,46,76,0.05)",
      nodeR: [1.1, 1.8],
      lineWidthMax: 0.95,
      bg: ["#ffffff", "#f4f8fc"],
      drift: 0.10
    }
  };

  var LERP_SPEED = 0.08;

  function lerpN(a, b, t) { return a + (b - a) * t; }

  function lerpColor(base, active, t) {
    return "rgba(" +
      Math.round(lerpN(base.r, active.r, t)) + "," +
      Math.round(lerpN(base.g, active.g, t)) + "," +
      Math.round(lerpN(base.b, active.b, t)) + "," +
      lerpN(base.a, active.a, t).toFixed(3) + ")";
  }

  function mount(canvas, opts) {
    opts = opts || {};
    var cfg = PRESETS[opts.preset] || PRESETS.atelier;
    var ctx = canvas.getContext("2d");

    var mouse = { x: -9999, y: -9999 };
    var target = { x: -9999, y: -9999 };
    var ripples = [];
    var W = 0, H = 0, dpr = 1;
    var raf = 0;

    // Respect the visitor's motion preference: a static grid, no ride.
    var still = global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setSize() {
      dpr = Math.min(global.devicePixelRatio || 1, 2);
      W = global.innerWidth;
      H = global.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // One grid point, displaced by the pointer and by any live ripples.
    // Edge rows and columns are pinned so the sheet never tears at its border.
    function warp(gx, gy, col, row, cols, rows, now) {
      var edge = 1.5;
      var colPin = Math.min(col / edge, (cols - 1 - col) / edge, 1);
      var rowPin = Math.min(row / edge, (rows - 1 - row) / edge, 1);
      var pin = colPin * colPin * rowPin * rowPin;

      var dx = gx - mouse.x;
      var dy = gy - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var proximity = Math.max(0, 1 - dist / cfg.influence) * pin;

      var rx = 0, ry = 0;

      // Idle breathing, so the sheet is alive before anyone touches it.
      if (cfg.drift && !still) {
        var ph = now / 1000;
        rx += Math.sin(ph * 0.6 + row * 0.35) * cfg.drift * pin;
        ry += Math.cos(ph * 0.5 + col * 0.3) * cfg.drift * pin;
      }

      for (var i = 0; i < ripples.length; i++) {
        var rp = ripples[i];
        var rdx = gx - rp.x, rdy = gy - rp.y;
        var rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        var waveWidth = 55;
        var diff = rdist - rp.radius;
        if (Math.abs(diff) < waveWidth) {
          var strength = (1 - Math.abs(diff) / waveWidth) * rp.opacity * 18 * pin;
          var ang = Math.atan2(rdy, rdx);
          var sign = diff < 0 ? -1 : 1;
          rx += Math.cos(ang) * strength * sign * -1;
          ry += Math.sin(ang) * strength * sign * -1;
        }
      }

      if (dist < cfg.influence && dist > 0 && pin > 0) {
        var t = dist / cfg.influence;
        var eased = t < 0.01 ? 0 : (1 - t) * (1 - t) * Math.min(1, dist / 60);
        var amt = eased * cfg.maxWarp * pin;
        var a = Math.atan2(dy, dx);
        return {
          x: gx - Math.cos(a) * amt + rx,
          y: gy - Math.sin(a) * amt + ry,
          p: proximity
        };
      }
      return { x: gx + rx, y: gy + ry, p: proximity };
    }

    function draw(now) {
      ctx.clearRect(0, 0, W, H);

      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, cfg.bg[0]);
      g.addColorStop(1, cfg.bg[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // Static dot texture under the grid: paper tooth, not decoration.
      ctx.fillStyle = cfg.dot;
      for (var x = cfg.dotSpacing / 2; x < W; x += cfg.dotSpacing) {
        for (var y = cfg.dotSpacing / 2; y < H; y += cfg.dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (var i = ripples.length - 1; i >= 0; i--) {
        var age = (now - ripples[i].born) / 1000;
        ripples[i].radius = Math.max(0, age * 400);
        ripples[i].opacity = Math.max(0, 1 - age * 1.2);
        if (ripples[i].opacity <= 0) ripples.splice(i, 1);
      }

      var cols = Math.max(2, Math.ceil(W / cfg.cell)) + 1;
      var rows = Math.max(2, Math.ceil(H / cfg.cell)) + 1;
      var cw = W / (cols - 1), ch = H / (rows - 1);

      var pts = [];
      for (var row = 0; row < rows; row++) {
        pts[row] = [];
        for (var col = 0; col < cols; col++) {
          pts[row][col] = warp(col * cw, row * ch, col, row, cols, rows, now);
        }
      }

      function seg(p1, p2) {
        var avg = (p1.p + p2.p) / 2;
        var t = avg * avg * (3 - 2 * avg);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = lerpColor(cfg.lineBase, cfg.lineActive, t);
        ctx.lineWidth = lerpN(0.8, cfg.lineWidthMax === undefined ? 1.6 : cfg.lineWidthMax, t);
        ctx.stroke();
      }

      ctx.lineCap = "butt";
      for (var r1 = 0; r1 < rows; r1++)
        for (var c1 = 0; c1 < cols - 1; c1++) seg(pts[r1][c1], pts[r1][c1 + 1]);
      for (var c2 = 0; c2 < cols; c2++)
        for (var r2 = 0; r2 < rows - 1; r2++) seg(pts[r2][c2], pts[r2 + 1][c2]);

      for (var r3 = 0; r3 < rows; r3++) {
        for (var c3 = 0; c3 < cols; c3++) {
          var p = pts[r3][c3];
          var t2 = p.p * p.p * (3 - 2 * p.p);
          var rad = lerpN(cfg.nodeR[0], cfg.nodeR[1], t2);

          if (t2 > 0.3) {
            var glowR = rad + lerpN(0, 7, (t2 - 0.3) / 0.7);
            var grd = ctx.createRadialGradient(p.x, p.y, rad * 0.5, p.x, p.y, glowR);
            var gm = cfg.glowMax === undefined ? 0.35 : cfg.glowMax;
            grd.addColorStop(0, "rgba(" + cfg.glow + "," + (t2 * gm).toFixed(3) + ")");
            grd.addColorStop(1, "rgba(" + cfg.glow + ",0)");
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor(cfg.nodeBase, cfg.nodeActive, t2);
          ctx.fill();
        }
      }

      for (var k = 0; k < ripples.length; k++) {
        ctx.beginPath();
        ctx.arc(ripples[k].x, ripples[k].y, Math.max(0, ripples[k].radius), 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(" + cfg.ripple + "," + (ripples[k].opacity * 0.3).toFixed(3) + ")";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    function frame(now) {
      mouse.x = lerpN(mouse.x, target.x, LERP_SPEED);
      mouse.y = lerpN(mouse.y, target.y, LERP_SPEED);
      draw(now);
      raf = global.requestAnimationFrame(frame);
    }

    setSize();
    global.addEventListener("resize", setSize);
    global.addEventListener("mousemove", function (e) {
      target.x = e.clientX;
      target.y = e.clientY;
    });
    global.addEventListener("click", function (e) {
      ripples.push({ x: e.clientX, y: e.clientY, radius: 0, opacity: 1, born: performance.now() });
    });

    if (still) { draw(0); } else { raf = global.requestAnimationFrame(frame); }

    return { ripple: function (x, y) {
      ripples.push({ x: x, y: y, radius: 0, opacity: 1, born: performance.now() });
    } };
  }

  global.KineticGrid = { mount: mount, presets: PRESETS };
})(window);
