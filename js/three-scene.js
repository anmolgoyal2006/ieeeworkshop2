/* ============================================================
   THREE-SCENE.JS  —  Living Forest 3D Background
   Fixed: larger particles, brighter, correct z-index layering
   ============================================================ */

(function () {
  'use strict';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryStart);
  } else {
    tryStart();
  }

  function tryStart() {
    if (typeof THREE === 'undefined') {
      var tries = 0;
      var poll = setInterval(function () {
        tries++;
        if (typeof THREE !== 'undefined') { clearInterval(poll); initScene(); }
        else if (tries > 100) { clearInterval(poll); }
      }, 50);
    } else {
      initScene();
    }
  }

  function initScene() {
    var canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    /* ── Force canvas on top of everything ── */
    canvas.style.cssText = [
      'position:fixed',
      'top:0', 'left:0',
      'width:100vw', 'height:100vh',
      'z-index:1',          /* same layer as reveal-viewport so it shows */
      'pointer-events:none',
      'display:block',
      'opacity:1'
    ].join(';');

    var W = window.innerWidth;
    var H = window.innerHeight;

    /* ── Renderer ── */
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'default'
    });
    renderer.setClearColor(0x000000, 0);   /* transparent background */
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);

    /* ── Scene & Camera ── */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    camera.position.z = 5;

    /* ─────────────────────────────────────────────────────
       STARS / PARTICLES  —  big, bright, definitely visible
    ───────────────────────────────────────────────────── */
    var STAR_COUNT = 3000;
    var starGeo    = new THREE.BufferGeometry();
    var positions  = new Float32Array(STAR_COUNT * 3);
    var colors     = new Float32Array(STAR_COUNT * 3);
    var sizes      = new Float32Array(STAR_COUNT);
    var velocities = new Float32Array(STAR_COUNT * 3); /* for drift */

    /* Color palette: vivid greens, cyans, whites */
    var colorPalette = [
      [0.0,  1.0,  0.53],  /* #00ff88 neon green  */
      [0.0,  0.90, 1.0],   /* #00e5ff cyan        */
      [0.3,  1.0,  0.7],   /* #4dffb4 seafoam     */
      [1.0,  1.0,  1.0],   /* white               */
      [0.6,  1.0,  0.85],  /* light teal          */
      [0.8,  1.0,  0.9],   /* pale mint           */
    ];

    for (var i = 0; i < STAR_COUNT; i++) {
      var i3 = i * 3;

      /* Spread across a wide frustum */
      positions[i3]     = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 12;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      /* Slow upward + sideways drift */
      velocities[i3]     = (Math.random() - 0.5) * 0.003;
      velocities[i3 + 1] = Math.random() * 0.004 + 0.0005;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

      /* Random color from palette */
      var c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3]     = c[0];
      colors[i3 + 1] = c[1];
      colors[i3 + 2] = c[2];

      /* Varied sizes — much bigger than before */
      sizes[i] = Math.random() * 4 + 1;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    /* Create a circular sprite texture in-memory */
    var spriteCanvas  = document.createElement('canvas');
    spriteCanvas.width  = 64;
    spriteCanvas.height = 64;
    var sCtx = spriteCanvas.getContext('2d');
    var grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,    'rgba(255,255,255,1)');
    grad.addColorStop(0.3,  'rgba(255,255,255,0.8)');
    grad.addColorStop(0.7,  'rgba(255,255,255,0.2)');
    grad.addColorStop(1.0,  'rgba(255,255,255,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 64, 64);
    var spriteTex = new THREE.CanvasTexture(spriteCanvas);

    var starMat = new THREE.PointsMaterial({
      size:         0.18,          /* base size in world units */
      map:          spriteTex,
      vertexColors: true,
      transparent:  true,
      opacity:      0.95,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
      sizeAttenuation: true
    });

    var starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    /* ─────────────────────────────────────────────────────
       LARGE GLOWING ORBS  — 60 bigger pollen dots
    ───────────────────────────────────────────────────── */
    var orbGeo  = new THREE.BufferGeometry();
    var orbPos  = new Float32Array(60 * 3);
    var orbCol  = new Float32Array(60 * 3);
    var orbData = []; /* per-orb animation data */

    for (var o = 0; o < 60; o++) {
      var o3 = o * 3;
      var ox = (Math.random() - 0.5) * 18;
      var oy = (Math.random() - 0.5) * 10;
      var oz = (Math.random() - 0.5) * 6;
      orbPos[o3]     = ox;
      orbPos[o3 + 1] = oy;
      orbPos[o3 + 2] = oz;

      var oc = colorPalette[Math.floor(Math.random() * 3)]; /* greens only */
      orbCol[o3]     = oc[0];
      orbCol[o3 + 1] = oc[1];
      orbCol[o3 + 2] = oc[2];

      orbData.push({
        vy:   Math.random() * 0.005 + 0.001,
        vx:   (Math.random() - 0.5) * 0.003,
        bobF: Math.random() * 1.2 + 0.5,
        bobA: Math.random() * 0.4 + 0.1,
        ph:   Math.random() * Math.PI * 2
      });
    }

    orbGeo.setAttribute('position', new THREE.BufferAttribute(orbPos, 3));
    orbGeo.setAttribute('color',    new THREE.BufferAttribute(orbCol, 3));

    var orbMat = new THREE.PointsMaterial({
      size:         0.45,
      map:          spriteTex,
      vertexColors: true,
      transparent:  true,
      opacity:      0.85,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
      sizeAttenuation: true
    });

    var orbField = new THREE.Points(orbGeo, orbMat);
    scene.add(orbField);

    /* ─────────────────────────────────────────────────────
       FIREFLY STREAKS  — 30 moving Lines
    ───────────────────────────────────────────────────── */
    var streaks = [];
    for (var s = 0; s < 30; s++) {
      var sg = new THREE.BufferGeometry();
      var sv = new Float32Array(6); /* 2 vertices */
      var sx = (Math.random() - 0.5) * 20;
      var sy = (Math.random() - 0.5) * 12;
      var sz = (Math.random() - 0.5) * 8;
      sv[0] = sx; sv[1] = sy; sv[2] = sz;
      sv[3] = sx + (Math.random() - 0.5) * 0.4;
      sv[4] = sy + Math.random() * 0.3;
      sv[5] = sz;
      sg.setAttribute('position', new THREE.BufferAttribute(sv, 3));
      var shue = 0.30 + Math.random() * 0.18;
      var sm = new THREE.LineBasicMaterial({
        color:      new THREE.Color().setHSL(shue, 1.0, 0.65),
        transparent: true,
        opacity:    Math.random() * 0.5 + 0.3,
        blending:   THREE.AdditiveBlending,
        depthWrite: false
      });
      var sline = new THREE.Line(sg, sm);
      streaks.push({
        line:  sline,
        geo:   sg,
        verts: sv,
        phase: Math.random() * Math.PI * 2,
        freq:  Math.random() * 2 + 0.8,
        vy:    (Math.random() - 0.5) * 0.006,
        vx:    (Math.random() - 0.5) * 0.008
      });
      scene.add(sline);
    }

    /* ─────────────────────────────────────────────────────
       SUBTLE LIGHTS
    ───────────────────────────────────────────────────── */
    var L1 = new THREE.PointLight(0x00ff88, 1.5, 20);
    L1.position.set(-4, 3, 3);
    scene.add(L1);
    var L2 = new THREE.PointLight(0x00e5ff, 1.2, 18);
    L2.position.set(4, -2, 3);
    scene.add(L2);
    scene.add(new THREE.AmbientLight(0x011a06, 0.8));

    /* ── Mouse parallax ── */
    var mX = 0, mY = 0, tX = 0, tY = 0;
    window.addEventListener('mousemove', function (e) {
      mX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ── Resize ── */
    window.addEventListener('resize', function () {
      W = window.innerWidth; H = window.innerHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });

    /* ─────────────────────────────────────────────────────
       RENDER LOOP
    ───────────────────────────────────────────────────── */
    var t0  = performance.now();
    var pos = starGeo.attributes.position.array;
    var opos = orbGeo.attributes.position.array;

    function animate() {
      requestAnimationFrame(animate);

      var elapsed = (performance.now() - t0) * 0.001;

      /* Camera parallax */
      tX += (mX - tX) * 0.03;
      tY += (mY - tY) * 0.03;
      camera.position.x = tX * 0.6;
      camera.position.y = -tY * 0.4;

      /* Slow rotation of the entire star field */
      starField.rotation.y = elapsed * 0.012;
      starField.rotation.x = Math.sin(elapsed * 0.05) * 0.03;

      /* Drift stars */
      for (var i = 0; i < STAR_COUNT; i++) {
        var i3 = i * 3;
        pos[i3]     += velocities[i3];
        pos[i3 + 1] += velocities[i3 + 1];
        pos[i3 + 2] += velocities[i3 + 2];
        if (pos[i3 + 1] > 6)   pos[i3 + 1] = -6;
        if (pos[i3]     > 10)  pos[i3]      = -10;
        if (pos[i3]     < -10) pos[i3]      =  10;
      }
      starGeo.attributes.position.needsUpdate = true;

      /* Pulse star opacity */
      starMat.opacity = 0.80 + Math.sin(elapsed * 0.6) * 0.15;

      /* Orbs float upward */
      for (var o = 0; o < 60; o++) {
        var o3 = o * 3;
        var od = orbData[o];
        opos[o3]     += od.vx;
        opos[o3 + 1] += od.vy + Math.sin(elapsed * od.bobF + od.ph) * 0.0005 * od.bobA;
        if (opos[o3 + 1] > 7)  { opos[o3 + 1] = -7; opos[o3] = (Math.random()-0.5)*18; }
        if (opos[o3] > 10)  od.vx = -Math.abs(od.vx);
        if (opos[o3] < -10) od.vx =  Math.abs(od.vx);
      }
      orbGeo.attributes.position.needsUpdate = true;
      orbMat.opacity = 0.7 + Math.sin(elapsed * 0.8) * 0.2;

      /* Firefly streaks blink & drift */
      for (var s = 0; s < streaks.length; s++) {
        var st = streaks[s];
        var blink = Math.abs(Math.sin(elapsed * st.freq + st.phase));
        st.line.material.opacity = blink * 0.7;
        st.line.material.needsUpdate = true;
        var sv = st.verts;
        sv[0] += st.vx; sv[1] += st.vy;
        sv[3] += st.vx; sv[4] += st.vy;
        if (sv[1] > 7)  { sv[1] = -7; sv[4] = -6.7; sv[0] = (Math.random()-0.5)*20; sv[3] = sv[0]+0.3; }
        st.geo.attributes.position.needsUpdate = true;
      }

      /* Light pulse */
      L1.intensity = 1.2 + Math.sin(elapsed * 0.9) * 0.4;
      L2.intensity = 1.0 + Math.cos(elapsed * 0.7) * 0.3;

      renderer.render(scene, camera);
    }

    animate();
  }

})();
