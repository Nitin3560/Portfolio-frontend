  /* ---------- wallpaper: sunset landscape ---------- */
  var cv = document.getElementById("wall");
  // The signal feature checks this list for the former skyline's neon signs.
  var signs = [];
  function drawWall(){
    // CSS renders the supplied image responsively without a canvas animation.
    cv.width = 1;
    cv.height = 1;
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

