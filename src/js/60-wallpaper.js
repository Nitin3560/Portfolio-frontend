  /* ---------- wallpaper: Tokyo dusk ---------- */
  var cv = document.getElementById("wall"), ctx = cv.getContext("2d");
  function rng(seed){ return function(){ seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }

  /* ---------- neon signs ----------
     Vertical kanji signs on the skyline. They are painted into the wallpaper
     like everything else; the one that flickers is repainted on its own slow,
     irregular timer rather than a rAF loop, so an idle desktop still costs
     nothing. Each sign remembers the building colour behind it so it can be
     erased without redrawing the city. */
  var SIGN_WORDS = ["喫茶", "ホテル", "スナック", "ラーメン", "居酒屋", "純喫茶"];
  var SIGN_HUES = ["#E85A9B", "#6FD6E8", "#F5A657"];
  var signs = [], signTimer = null;

  function makeSign(bx, by, bw, rnd){
    var word = SIGN_WORDS[(rnd() * SIGN_WORDS.length) | 0];
    var size = 9 + Math.round(rnd() * 3);
    var pad = 3;
    var w = size + pad * 2;
    var h = word.length * (size + 2) + pad * 2;
    return {
      word: word,
      color: SIGN_HUES[(rnd() * SIGN_HUES.length) | 0],
      size: size, pad: pad,
      x: Math.round(bx + bw / 2 - w / 2),
      y: Math.round(by + 10),
      w: w, h: h
    };
  }

  function paintSign(sg2, on){
    ctx.save();
    ctx.fillStyle = "#180F30";                 /* the building behind it */
    ctx.fillRect(sg2.x - 1, sg2.y - 1, sg2.w + 2, sg2.h + 2);
    ctx.globalAlpha = on ? 1 : 0.18;
    ctx.strokeStyle = sg2.color; ctx.lineWidth = 1;
    ctx.strokeRect(sg2.x + 0.5, sg2.y + 0.5, sg2.w - 1, sg2.h - 1);
    ctx.fillStyle = sg2.color;
    ctx.font = sg2.size + 'px "DotGothic16","Zen Kaku Gothic New",sans-serif';
    ctx.textAlign = "center"; ctx.textBaseline = "top";
    if(on){ ctx.shadowColor = sg2.color; ctx.shadowBlur = 6; }
    for(var i = 0; i < sg2.word.length; i++){
      ctx.fillText(sg2.word.charAt(i),
                   sg2.x + sg2.w / 2,
                   sg2.y + sg2.pad + i * (sg2.size + 2));
    }
    ctx.restore();
  }

  /* One sign has a bad tube. Irregular gaps, and it stops dead when the tab is
     hidden or the user asked for less motion. */
  function flicker(){
    if(signTimer){ clearTimeout(signTimer); signTimer = null; }
    if(reduced || !signs.length) return;
    var sg2 = signs[signs.length - 1];
    (function step(){
      if(document.hidden){ signTimer = setTimeout(step, 1200); return; }
      var on = Math.random() > 0.28;
      paintSign(sg2, on);
      signTimer = setTimeout(step, on ? 260 + Math.random() * 2400 : 45 + Math.random() * 110);
    })();
  }
  document.addEventListener("visibilitychange", function(){
    if(!document.hidden && signs.length) flicker();
  });

  function drawWall(){
    signs = [];
    if(signTimer){ clearTimeout(signTimer); signTimer = null; }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = cv.clientWidth, H = cv.clientHeight;
    if(!W || !H) return;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,W,H);

    var hz = Math.round(H * 0.62);

    var sky = ctx.createLinearGradient(0,0,0,hz);
    sky.addColorStop(0,   "#150F33");
    sky.addColorStop(0.42,"#3E2160");
    sky.addColorStop(0.72,"#8A2F70");
    sky.addColorStop(0.90,"#D8497F");
    sky.addColorStop(1,   "#F5A657");
    ctx.fillStyle = sky; ctx.fillRect(0,0,W,hz);

    /* stars */
    var r = rng(20260501);
    for(var i=0;i<130;i++){
      var sx = r()*W, sy = r()*hz*0.6;
      var a = (1 - sy/(hz*0.6)) * 0.85 * r();
      ctx.fillStyle = "rgba(255,255,255," + a.toFixed(3) + ")";
      ctx.fillRect(Math.round(sx), Math.round(sy), 1.4, 1.4);
    }

    /* sun with slit bands */
    var cx = W * 0.72, cy = hz - H*0.055, rad = Math.max(70, Math.min(W,H) * 0.17);
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI*2); ctx.clip();
    var sg = ctx.createLinearGradient(0, cy-rad, 0, cy+rad);
    sg.addColorStop(0,"#FFF0B8"); sg.addColorStop(0.45,"#F8A85E"); sg.addColorStop(1,"#E8407F");
    ctx.fillStyle = sg; ctx.fillRect(cx-rad, cy-rad, rad*2, rad*2);
    for(var b=0;b<9;b++){
      var y = cy - rad*0.15 + b * (rad*0.145);
      var t = 2 + b * 1.5;
      ctx.clearRect(cx-rad, y, rad*2, t);
    }
    ctx.restore();
    ctx.globalAlpha = 0.30; ctx.fillStyle = "#E8407F";
    ctx.beginPath(); ctx.arc(cx, cy, rad*1.28, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 1;

    /* skyline */
    var bx = 0, r2 = rng(771103), tallest = null;
    while(bx < W){
      var bw = 22 + r2()*54;
      var bh = 24 + r2()*Math.min(190, H*0.24);
      var by = hz - bh;
      ctx.fillStyle = "#180F30";
      ctx.fillRect(Math.round(bx), Math.round(by), Math.round(bw), Math.round(bh)+2);
      for(var wy = by+8; wy < hz-8; wy += 11){
        for(var wx = bx+5; wx < bx+bw-6; wx += 9){
          if(r2() > 0.62){
            ctx.fillStyle = r2() > 0.5 ? "rgba(245,166,87,.85)" : "rgba(111,214,232,.7)";
            ctx.fillRect(Math.round(wx), Math.round(wy), 3, 4);
          }
        }
      }
      /* A vertical neon sign on some of the taller buildings. Positions are
         remembered so one of them can be flickered later without repainting
         the whole wallpaper. */
      /* Thresholds are relative so the short mobile skyline still lights a
         couple of signs. min() leaves the desktop numbers exactly as they
         were, which matters: r2() is a seeded sequence, and calling makeSign
         at a different moment would redraw the whole city. */
      if(bh > Math.min(90, hz * 0.34) && bw > Math.min(34, W * 0.07)
         && r2() > 0.55 && signs.length < 5){
        signs.push(makeSign(bx, by, bw, r2));
      }
      if(!tallest || bh > tallest.bh) tallest = {bx:bx, by:by, bw:bw, bh:bh};
      bx += bw + 3 + r2()*10;
    }
    /* The skyline is seeded, so whether any building clears the bar above is
       fixed per viewport — and on a phone this particular seed clears it
       nowhere, which would leave the signs (and what lives in them) missing
       entirely on mobile. One is guaranteed, on the tallest roof. */
    if(!signs.length && tallest){
      signs.push(makeSign(tallest.bx, tallest.by, tallest.bw, r2));
    }
    signs.forEach(function(sg2){ paintSign(sg2, true); });

    /* ground */
    var gr = ctx.createLinearGradient(0,hz,0,H);
    gr.addColorStop(0,"#180F30"); gr.addColorStop(1,"#0C0820");
    ctx.fillStyle = gr; ctx.fillRect(0,hz,W,H-hz);
    ctx.fillStyle = "#F5A657"; ctx.fillRect(0,hz-1,W,2);

    /* perspective grid */
    ctx.strokeStyle = "rgba(111,214,232,.30)"; ctx.lineWidth = 1;
    var vpx = cx;
    for(var g=-26; g<=26; g++){
      ctx.beginPath();
      ctx.moveTo(vpx, hz);
      ctx.lineTo(vpx + g * (W*0.16), H);
      ctx.stroke();
    }
    var yy = hz, step = 2.2;
    while(yy < H){
      yy += step; step *= 1.34;
      ctx.globalAlpha = Math.min(1, (yy-hz)/(H-hz) + 0.15);
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    flicker();
  }

  /* ===================== MUSIC =====================
     Leave USER_TRACKS empty and the player synthesizes its own music in the
     browser (no files, nothing streamed).

     To play your own audio instead, put the files in a "music" folder next to
     this index.html and list them here. Nothing else needs to change:

       var USER_TRACKS = [
         {title:"Midnight Line", meta:"Artist name", src:"music/midnight-line.mp3"},
         {title:"Harbour",       meta:"Artist name", src:"music/harbour.mp3"}
       ];

     Use exact filenames, and avoid spaces in them (use-dashes-like-this.mp3).
     Only host music you have the right to distribute.
     ================================================= */
  var USER_TRACKS = [];

  var CH = [
    {
      name:"Night Drive", bpm:112, swing:0.055, hatEvery:2,
      kick:[0,6,10], snare:[4,12], bass:[0,3,6,8,11,14], stabs:[2,6,11],
      roots:[41,40,38,43,36,45,38,43],
      prog:[[60,64,65,69],[59,62,64,67],[60,62,65,69],[59,62,65,67],
            [64,67,71,72],[60,64,67,69],[60,62,65,69],[59,62,65,67]]
    },
    {
      name:"Harbor Lights", bpm:94, swing:0.07, hatEvery:4,
      kick:[0,10], snare:[4,12], bass:[0,6,8,14], stabs:[4,12],
      roots:[38,37,35,40,45,42,35,40],
      prog:[[62,66,69,73],[61,64,68,71],[59,62,66,69],[64,68,71,74],
            [57,61,64,68],[66,69,73,76],[59,62,66,69],[64,68,71,74]]
    },
    {
      name:"Neon Rain", bpm:124, swing:0.03, hatEvery:2,
      kick:[0,7,10], snare:[4,12], bass:[0,2,4,6,8,10,12,14], stabs:[2,6,10,14],
      roots:[45,41,36,43,45,41,38,40],
      prog:[[60,64,67,71],[60,64,65,69],[59,64,67,71],[59,62,64,67],
            [60,64,67,71],[60,64,65,69],[60,62,65,69],[59,64,68,71]]
    }
  ];

  /* The player has two sources: the audio files listed above, and the FM
     synthesiser further down that generates CH live in the browser. Both are
     always available — chiptune mode is not a fallback, it is a choice. */
  var hasFiles = USER_TRACKS.length > 0;
  var fileMode = hasFiles;
  var LIST = fileMode ? USER_TRACKS : CH;

  /* iOS / iPadOS: an <audio> element routed through createMediaElementSource is
     unreliable there — it commonly yields silence — and once the element's
     output lives inside an AudioContext it is also silenced by the hardware
     ringer switch. So in file mode on Apple touch devices we build no graph at
     all and let the element play straight to the speakers. The cost is the
     spectrum analyser and the volume slider, and iOS ignores writes to
     HTMLMediaElement.volume anyway, so the slider was never real there. */
  var isApple = /iP(hone|ad|od)/.test(navigator.platform || "")
             || /iPad|iPhone|iPod/.test(navigator.userAgent)
             || (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  var useGraph = !(fileMode && isApple);
  function refreshGraphNeed(){ useGraph = !(fileMode && isApple); }

  var ac = null, master, comp, analyser, delay, wet, noiseBuf, mediaSrc, audioEl;
  var timer = null, nextTime = 0, stepIdx = 0;
  var playing = false, plIdx = 0, startedAt = 0, elapsed = 0, vol = 0.35, muted = false;
  var needsGesture = false, starting = false, lastErr = "";

  var elTitle  = document.getElementById("plTitle");
  var elSub    = document.getElementById("plSub");
  var elTime   = document.getElementById("plTime");
  var elPlay   = document.getElementById("plPlay");
  var elVol    = document.getElementById("plVol");
  var elList   = document.getElementById("plList");
  var elViz    = document.getElementById("plViz");
  var elWin    = document.getElementById("plWin");
  var elNo     = document.getElementById("plNo");
  var elNote   = document.getElementById("plNote");
  var np       = document.getElementById("np");
  var trayVol  = document.getElementById("trayVol");
  var volPct   = document.getElementById("volPct");
  var volBtn   = document.getElementById("volBtn");
  var volPop   = document.getElementById("volPop");
  var muteBtn  = document.getElementById("muteBtn");
  var armHint  = document.getElementById("armHint");
  var lamp     = document.querySelector("#tray .lamp");
  var vg       = elViz.getContext("2d");

  var ICO = {
    play:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1 L14 8 L3 15 Z"/></svg>',
    pause:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="4" height="12"/><rect x="9" y="2" width="4" height="12"/></svg>',
    stop:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="3" width="10" height="10"/></svg>',
    prev:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2" width="3" height="12"/><path d="M14 2 L6 8 L14 14 Z"/></svg>',
    next:'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="11" y="2" width="3" height="12"/><path d="M2 2 L10 8 L2 14 Z"/></svg>'
  };
  document.getElementById("plPrev").innerHTML = ICO.prev;
  document.getElementById("plNext").innerHTML = ICO.next;
  elPlay.innerHTML = ICO.play;

  var SPK = {
    off:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 6h3l4-3v10L4 10H1z"/>'
       +'<path d="M10.6 5.9l1.1-1.1 4 4-1.1 1.1z"/><path d="M14.6 4.8l1.1 1.1-4 4-1.1-1.1z"/></svg>',
    low:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 6h3l4-3v10L4 10H1z"/>'
       +'<path d="M10 5.6a4 4 0 010 4.8V5.6z"/></svg>',
    high:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1 6h3l4-3v10L4 10H1z"/>'
       +'<path d="M10 5.6a4 4 0 010 4.8V5.6z"/><path d="M12.6 3.4a7 7 0 010 9.2V3.4z"/></svg>'
  };

  /* A slider is only real when a gain node stands between us and the speakers:
     always in chiptune mode, and in file mode only where the element is routed
     through the graph (i.e. everywhere except iOS).

     This asks useGraph, not mediaSrc: the media element is built lazily on the
     first play, so testing for the node hid the sliders on every fresh load
     until something happened to create it. */
  function sliderWorks(){ return !fileMode || useGraph; }

  function applyGain(){
    if(master && ac) master.gain.setTargetAtTime(muted ? 0 : vol, ac.currentTime, 0.02);
    if(audioEl && !mediaSrc){
      /* The element is going straight to the speakers, so its own volume is the
         control. iOS ignores writes to .volume but does honour .muted, so the
         Mute button keeps working even where the slider cannot. */
      try{ audioEl.volume = muted ? 0 : vol; }catch(e){}
      audioEl.muted = !!muted;
    }
    var pct = Math.round(vol * 100);
    if(elVol.value != pct) elVol.value = pct;
    if(trayVol.value != pct) trayVol.value = pct;
    volPct.textContent = muted ? "muted" : (sliderWorks() ? pct + "%" : "device buttons");
    volBtn.innerHTML = muted || vol === 0 ? SPK.off : (vol < 0.5 ? SPK.low : SPK.high);
    volBtn.setAttribute("aria-label", muted ? "Volume (muted)"
      : (sliderWorks() ? "Volume " + pct + "%" : "Sound"));
    muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
    muteBtn.textContent = muted ? "Unmute" : "Mute";
  }
  function setVol(v){ vol = Math.min(1, Math.max(0, v)); if(vol > 0) muted = false; applyGain(); }
  function setMuted(b){ muted = b; applyGain(); }

  /* crossOrigin is only needed when the audio lives on another origin; setting it
     on a same-origin file would fail on hosts that send no CORS headers. */
  function setSrc(url){
    try{
      var abs = new URL(url, location.href);
      if(abs.origin !== location.origin && location.protocol !== "file:") audioEl.crossOrigin = "anonymous";
      else audioEl.removeAttribute("crossorigin");
    }catch(e){}
    /* assigning src already runs the media load algorithm; an explicit load()
       here only adds a chance of aborting a play() we are about to make. */
    audioEl.setAttribute("src", url);
  }

  function mtof(m){ return 440 * Math.pow(2, (m - 69) / 12); }
  function fmtTime(s){
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

