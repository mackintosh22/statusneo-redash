/* StatusNeo Insights landing page behaviour. No dependencies; external file because Redash's CSP forbids inline scripts. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Nav / mega menu ---------- */
  var mega = document.getElementById("mega");
  var toggles = document.querySelectorAll("[data-mega-toggle]");
  function setMega(open) {
    if (!mega) return;
    mega.hidden = !open;
    toggles.forEach(function (t) {
      t.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  toggles.forEach(function (t) {
    t.addEventListener("click", function () {
      setMega(mega.hidden);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && mega && !mega.hidden) {
      setMega(false);
      if (toggles[0]) toggles[toggles.length > 1 && getComputedStyle(toggles[0]).display === "none" ? 1 : 0].focus();
    }
  });
  document.addEventListener("click", function (e) {
    if (mega && !mega.hidden && !e.target.closest("#top")) setMega(false);
  });
  if (mega) {
    mega.addEventListener("click", function (e) {
      if (e.target.closest('a[href^="#"]')) setMega(false);
    });
  }

  /* ---------- Loop instrument ---------- */
  var loop = document.querySelector("[data-loop]");
  if (!loop) return;
  var base = document.body.getAttribute("data-base") || "/";
  var R = 160, C = 2 * Math.PI * R, TAIL = 70; // degrees
  var ticks = loop.querySelector("[data-ticks]");
  var arrows = loop.querySelector("[data-arrows]");
  var tail = loop.querySelector("[data-tail]");
  var head = loop.querySelector("[data-head]");
  var nodes = Array.prototype.slice.call(loop.querySelectorAll("[data-phase]"));
  var consoleEl = loop.querySelector("[data-console]");
  var titleEl = loop.querySelector("[data-console-title]");
  var hintEl = loop.querySelector("[data-console-hint]");
  var bodyEl = loop.querySelector("[data-console-body]");
  var openEl = loop.querySelector("[data-console-open]");

  function pt(deg, r) {
    var a = (deg * Math.PI) / 180;
    return [200 + r * Math.cos(a), 200 + r * Math.sin(a)];
  }
  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  for (var i = 0; i < 72; i++) {
    var major = i % 18 === 0, d = i * 5;
    var p1 = pt(d, major ? 172 : 176), p2 = pt(d, 184);
    ticks.appendChild(el("line", { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], class: major ? "major" : "" }));
  }
  // clockwise chevrons halfway between the nodes (-45, 45, 135, 225 degrees)
  [-45, 45, 135, 225].forEach(function (deg) {
    var c = pt(deg, R), t = deg + 90;
    var g = el("path", { d: "M-6 -5 L6 0 L-6 5 Z", transform: "translate(" + c[0] + " " + c[1] + ") rotate(" + t + ")" });
    arrows.appendChild(g);
  });

  var phases = [
    {
      name: "Design", hint: "Shape the question", href: "queries/new", angle: -90,
      render: function (done) {
        var text = [
          ["k", "SELECT"], ["", " region,\n       "], ["k", "SUM"], ["", "(revenue) "], ["k", "AS"], ["", " revenue\n"],
          ["k", "FROM"], ["", " orders\n"], ["k", "WHERE"], ["", " order_date >= "], ["p", "{{ start_date }}"], ["", "\n"],
          ["k", "GROUP BY"], ["", " region;"]
        ];
        var out = bodyEl.innerHTML = '<div class="code" data-code></div><p class="cap">Sample query</p>';
        var box = bodyEl.querySelector("[data-code]");
        var flat = [];
        text.forEach(function (seg) { for (var j = 0; j < seg[1].length; j++) flat.push([seg[0], seg[1][j]]); });
        function paint(n) {
          var html = "", last = null, buf = "";
          function flush() { if (buf) html += last ? '<span class="' + last + '">' + buf + "</span>" : buf; buf = ""; }
          for (var j = 0; j < n; j++) {
            if (flat[j][0] !== last) { flush(); last = flat[j][0]; }
            buf += flat[j][1].replace(/&/g, "&amp;").replace(/</g, "&lt;");
          }
          flush();
          box.innerHTML = html + '<span class="caret"></span>';
        }
        if (reduce) { paint(flat.length); return; }
        var n = 0;
        var timer = setInterval(function () {
          n += 2; paint(Math.min(n, flat.length));
          if (n >= flat.length) clearInterval(timer);
        }, 28);
        done(function () { clearInterval(timer); });
      }
    },
    {
      name: "Engineer", hint: "Build the answer", href: "dashboards", angle: 0,
      render: function () {
        var data = [["APAC", 78], ["EMEA", 100], ["AMER", 64], ["LATAM", 41], ["MEA", 52]];
        bodyEl.innerHTML = '<div class="bars">' + data.map(function (d) {
          return '<i style="--h:' + d[1] * 0.9 + '%" data-l="' + d[0] + '"></i>';
        }).join("") + '</div><p class="cap">Revenue by region &middot; sample data</p>';
        var b = bodyEl.querySelector(".bars");
        if (reduce) b.className = "bars go"; else requestAnimationFrame(function () { requestAnimationFrame(function () { b.className = "bars go"; }); });
      }
    },
    {
      name: "Automate", hint: "Keep it fresh", href: "alerts", angle: 90,
      render: function () {
        bodyEl.innerHTML =
          '<svg class="spark" viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden="true">' +
          '<line class="thr" x1="0" y1="46" x2="200" y2="46"/>' +
          '<path class="line" d="M0 20 L25 26 L50 18 L75 30 L100 24 L125 38 L150 34 L175 52 L200 58"/></svg>' +
          '<div class="chips"><span class="chip">Refresh <b>every hour</b></span><span class="chip">Alert when <b>revenue &lt; threshold</b></span><span class="chip">Notify <b>Slack, email</b></span></div>';
        var s = bodyEl.querySelector(".spark");
        if (reduce) s.setAttribute("class", "spark go"); else requestAnimationFrame(function () { requestAnimationFrame(function () { s.setAttribute("class", "spark go"); }); });
      }
    },
    {
      name: "Govern", hint: "Control who sees what", href: "data_sources", angle: 180,
      render: function () {
        bodyEl.innerHTML = '<ul class="perm"><li>Analysts<span>query</span></li><li>Finance<span>view only</span></li><li>Admins<span>manage sources</span></li></ul><p class="cap">Groups decide which data sources each person can reach.</p>';
      }
    }
  ];

  var current = -1, cancelRender = null;
  function show(idx) {
    if (idx === current) return;
    current = idx;
    var ph = phases[idx];
    nodes.forEach(function (n, k) {
      var on = k === idx;
      n.classList.toggle("is-active", on);
      n.setAttribute("aria-pressed", on ? "true" : "false");
    });
    titleEl.textContent = ph.name;
    hintEl.textContent = ph.hint;
    openEl.setAttribute("href", base + ph.href);
    openEl.textContent = "Open " + ph.name + " in Insights";
    if (cancelRender) { cancelRender(); cancelRender = null; }
    ph.render(function (c) { cancelRender = c; });
  }

  /* Orbiting signal: clockwise, 4s per phase. Pauses while the user is interacting. */
  var theta = -90, paused = false, last = 0, resumeAt = 0, SPEED = 22.5; // deg per second
  function place() {
    var tailStart = theta - TAIL;
    tail.setAttribute("stroke-dasharray", (C * TAIL / 360) + " " + C);
    tail.setAttribute("transform", "rotate(" + tailStart + " 200 200)");
    var p = pt(theta, R);
    head.setAttribute("cx", p[0]); head.setAttribute("cy", p[1]);
  }
  function nearest() {
    var best = 0, bd = 999;
    phases.forEach(function (ph, k) {
      var d = Math.abs((((theta - ph.angle) % 360) + 540) % 360 - 180);
      if (d < bd) { bd = d; best = k; }
    });
    return best;
  }
  function frame(ts) {
    if (!last) last = ts;
    var dt = Math.min(0.1, (ts - last) / 1000); last = ts;
    if (!paused && ts > resumeAt) {
      theta += SPEED * dt;
      if (theta > 270) theta -= 360;
      show(nearest());
    }
    place();
    requestAnimationFrame(frame);
  }

  nodes.forEach(function (n) {
    n.addEventListener("click", function () {
      var k = parseInt(n.getAttribute("data-phase"), 10);
      theta = phases[k].angle;
      resumeAt = performance.now() + 9000;
      current = -1; show(k); place();
    });
  });
  ["mouseenter", "focusin"].forEach(function (ev) { loop.addEventListener(ev, function () { paused = true; }); });
  ["mouseleave", "focusout"].forEach(function (ev) { loop.addEventListener(ev, function () { paused = false; }); });

  show(0);
  place();
  if (!reduce) requestAnimationFrame(frame);
})();
