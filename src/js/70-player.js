  /* ----- audio graph, built on the first user gesture ----- */
  function initAudio(){
    if(ac || !useGraph) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    ac = new AC();

    master = ac.createGain();   master.gain.value = muted ? 0 : vol;
    comp   = ac.createDynamicsCompressor();
    analyser = ac.createAnalyser();
    analyser.fftSize = 128; analyser.smoothingTimeConstant = 0.72;

    delay = ac.createDelay(1.0); delay.delayTime.value = 0.30;
    var fb = ac.createGain(); fb.gain.value = 0.28;
    wet = ac.createGain(); wet.gain.value = 0.20;
    delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(master);

    master.connect(comp); comp.connect(analyser); analyser.connect(ac.destination);

    var n = ac.sampleRate * 2;
    noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for(var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }

  function noise(){ var s = ac.createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s; }

  function kick(t){
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(128, t);
    o.frequency.exponentialRampToValueAtTime(44, t + 0.11);
    g.gain.setValueAtTime(0.85, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.30);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + 0.32);
  }
  function snare(t){
    var s = noise(), bp = ac.createBiquadFilter(), g = ac.createGain();
    bp.type = "bandpass"; bp.frequency.value = 1900; bp.Q.value = 0.8;
    g.gain.setValueAtTime(0.32, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
    s.connect(bp); bp.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.2);
  }
  function hat(t, accent){
    var s = noise(), hp = ac.createBiquadFilter(), g = ac.createGain();
    hp.type = "highpass"; hp.frequency.value = 7600;
    g.gain.setValueAtTime(accent ? 0.13 : 0.07, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (accent ? 0.10 : 0.045));
    s.connect(hp); hp.connect(g); g.connect(master);
    s.start(t); s.stop(t + 0.14);
  }
  function bassNote(t, f, dur){
    var o = ac.createOscillator(), lp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = "sawtooth"; o.frequency.value = f;
    lp.type = "lowpass"; lp.Q.value = 5;
    lp.frequency.setValueAtTime(1000, t);
    lp.frequency.exponentialRampToValueAtTime(240, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.30, t + 0.014);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp); lp.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.04);
  }
  function ep(t, f, dur, amp){
    var car = ac.createOscillator(), mod = ac.createOscillator();
    var mg = ac.createGain(), g = ac.createGain();
    car.type = "sine"; mod.type = "sine";
    car.frequency.value = f; mod.frequency.value = f * 2;
    mg.gain.setValueAtTime(f * 2.1, t);
    mg.gain.exponentialRampToValueAtTime(f * 0.14, t + 0.22);
    mod.connect(mg); mg.connect(car.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    car.connect(g); g.connect(master); g.connect(delay);
    mod.start(t); car.start(t);
    mod.stop(t + dur + 0.05); car.stop(t + dur + 0.05);
  }
  function pluck(t, f){
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.11, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
    o.connect(g); g.connect(master); g.connect(delay);
    o.start(t); o.stop(t + 0.45);
  }

  /* ----- sequencer ----- */
  function step(i, t){
    var ch = CH[plIdx];
    var s = i % 16, bar = Math.floor(i / 16) % ch.prog.length;
    var chord = ch.prog[bar], root = ch.roots[bar];
    if(s % 2 === 1) t += ch.swing * (30 / ch.bpm);

    if(ch.kick.indexOf(s) > -1) kick(t);
    if(ch.snare.indexOf(s) > -1) snare(t);
    if(s % ch.hatEvery === 0) hat(t, s % 8 === 4);

    if(ch.bass.indexOf(s) > -1){
      var add = s === 0 ? 0 : (s % 8 === 0 ? 12 : (s === 6 || s === 14 ? 7 : 0));
      bassNote(t, mtof(root + add), s === 0 ? 0.30 : 0.18);
    }
    if(ch.stabs.indexOf(s) > -1){
      for(var v = 0; v < chord.length; v++) ep(t + v * 0.007, mtof(chord[v]), 0.55, 0.095);
    }
    if(s === 12 && bar % 2 === 1) pluck(t, mtof(chord[chord.length - 1] + 12));
    if(s === 0 && bar === 0) pluck(t, mtof(chord[0] + 12));
  }

  function tickSched(){
    var spb = 60 / CH[plIdx].bpm / 4;
    while(nextTime < ac.currentTime + 0.14){
      step(stepIdx, nextTime);
      nextTime += spb;
      stepIdx = (stepIdx + 1) % (16 * CH[plIdx].prog.length);
    }
  }

  /* ----- transport ----- */
  function render(){
    var item = LIST[plIdx];
    elTitle.textContent = item.name || item.title;
    elSub.textContent = lastErr ? lastErr
      : (needsGesture && !playing)
      ? "tap or click anywhere to start the music"
      : (fileMode ? (item.meta || "audio file")
                  : (item.bpm + " BPM · generated live · no files"));
    elPlay.innerHTML = playing ? ICO.pause : ICO.play;
    elPlay.setAttribute("aria-label", playing ? "Pause" : "Play");
    elWin.setAttribute("aria-label", playing ? "Pause" : "Play");
    elNo.textContent = String(plIdx + 1).padStart(2, "0");
    elNo.setAttribute("aria-label",
      "Track " + (plIdx + 1) + " of " + LIST.length + ". Show the tape index");
    Array.prototype.forEach.call(elList.children, function(li, i){
      li.setAttribute("aria-current", i === plIdx ? "true" : "false");
    });
    if(playing){ np.hidden = false; np.textContent = "♪ " + (item.name || item.title); }
    else np.hidden = true;
    lamp.classList.toggle("on", playing);
    syncTape();
    if(typeof startViz === "function"){ if(playing) startViz(); else { stopViz(); drawViz(); } }
  }

  function ensureEl(){
    if(audioEl) return;
    audioEl = new Audio();
    audioEl.preload = "auto";
    audioEl.playsInline = true;                 /* iOS: stay in the page */
    audioEl.setAttribute("playsinline", "");
    /* Kept in the document rather than floating free: it costs one hidden node,
       and it means the element shows up in dev tools like any other media. */
    audioEl.hidden = true;
    document.body.appendChild(audioEl);
    audioEl.addEventListener("ended", function(){ skip(1); });
    audioEl.addEventListener("error", function(){
      var c = audioEl.error && audioEl.error.code;
      starting = false; playing = false;
      lastErr = "could not load " + LIST[plIdx].src + (c ? " (media error " + c + ")" : "");
      render();
    });
    if(useGraph){
      mediaSrc = ac.createMediaElementSource(audioEl);
      mediaSrc.connect(master);
    }
    applyGain();          /* the element path carries its own volume */
  }

  function onPlayOk(){
    starting = false; playing = true; lastErr = "";
    disarm();             /* only now is sound actually coming out */
    render();
  }
  function onPlayFail(err){
    starting = false; playing = false;
    /* NotAllowedError just means "not from a gesture yet", and AbortError means
       the track changed mid-start; neither is worth showing. A missing or
       undecodable file surfaces as NotSupportedError here (and usually also as
       audioEl.error), and that the visitor should see. */
    var n = err && err.name;
    var me = audioEl && audioEl.error;
    if(me || n === "NotSupportedError"){
      lastErr = "could not load " + LIST[plIdx].src + (me ? " (media error " + me.code + ")" : "");
    } else if(n && n !== "NotAllowedError" && n !== "AbortError"){
      lastErr = "audio blocked by the browser (" + n + ")";
    } else {
      lastErr = "";
    }
    /* Only offer "Enable sound" when a gesture is genuinely what is missing —
       it cannot conjure up a file that isn't there. */
    if(armed && !lastErr){ armHint.hidden = false; needsGesture = true; }
    else if(lastErr){ armHint.hidden = true; needsGesture = false; }
    render();
  }

  function play(){
    if(playing && (timer || (fileMode && audioEl && !audioEl.paused))) return;
    if(starting) return;                        /* a start is already in flight */
    initAudio();
    if(ac && ac.state === "suspended") ac.resume();
    if(fileMode){
      ensureEl();
      if(!audioEl.getAttribute("src")) setSrc(LIST[plIdx].src);
      starting = true;
      playing = true;                           /* optimistic; undone on failure */
      var pr = audioEl.play();
      if(pr && pr.then) pr.then(onPlayOk, onPlayFail); else onPlayOk();
    } else {
      playing = true;
      nextTime = ac.currentTime + 0.08;
      startedAt = ac.currentTime - elapsed;
      timer = setInterval(tickSched, 25);
    }
    render();
  }
  function pause(){
    playing = false;
    if(fileMode){ if(audioEl) audioEl.pause(); }
    else {
      clearInterval(timer); timer = null;
      elapsed = ac ? ac.currentTime - startedAt : 0;
    }
    render();
  }
  function stop(){
    pause();
    elapsed = 0; stepIdx = 0;
    if(fileMode && audioEl){ try{ audioEl.currentTime = 0; }catch(e){} }
    elTime.textContent = "0:00";
    tapeAt = -1; setTape(0);
    render();
  }
  function skip(dir){
    var was = playing;
    stop();
    plIdx = (plIdx + dir + LIST.length) % LIST.length;
    if(fileMode && audioEl) setSrc(LIST[plIdx].src);
    render();
    if(was) play();
  }
  function select(i){
    if(i === plIdx){ playing ? pause() : play(); return; }
    var was = playing;
    stop();
    plIdx = i;
    if(fileMode && audioEl) setSrc(LIST[plIdx].src);
    render();
    play();
  }

  /* One toggle, two affordances: the deck key and the tape window both call it.
     That is not a second audio state — it is two ways to press play. */
  function toggle(){
    /* The very first press also has to arm the audio, and the document-level
       arming listener runs in the capture phase — so by the time the press
       reaches this element, playback has already started. Toggling then would
       immediately pause it again. The first press always means "start". */
    var wasArming = !!armGo;
    disarm();
    if(wasArming){ play(); return; }
    if(playing) pause(); else play();
  }
  elPlay.addEventListener("click", toggle);
  document.getElementById("plWin").addEventListener("click", toggle);
  document.getElementById("plPrev").addEventListener("click", function(){ disarm(); skip(-1); });
  document.getElementById("plNext").addEventListener("click", function(){ disarm(); skip(1); });
  elVol.addEventListener("input",  function(){ setVol(+elVol.value / 100); });
  trayVol.addEventListener("input", function(){ setVol(+trayVol.value / 100); });
  muteBtn.addEventListener("click", function(){ setMuted(!muted); });

  function closeVol(){ volPop.hidden = true; volBtn.setAttribute("aria-expanded", "false"); }
  volBtn.addEventListener("click", function(e){
    e.stopPropagation();
    var show = volPop.hidden;
    volPop.hidden = !show;
    volBtn.setAttribute("aria-expanded", show ? "true" : "false");
    if(show) trayVol.focus();
  });
  document.addEventListener("click", function(e){
    if(!volPop.contains(e.target) && e.target !== volBtn) closeVol();
  });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeVol(); });

  function span(cls, text){
    var e = document.createElement("span");
    if(cls) e.className = cls;
    e.textContent = text;
    return e;
  }
  function buildList(){
    elList.innerHTML = "";
    LIST.forEach(function(item, i){
      var li = document.createElement("li");
      li.setAttribute("aria-current", i === plIdx ? "true" : "false");
      var b = document.createElement("button");
      b.type = "button";
      /* built as nodes, not markup: track names come from tracks.json, which is
         edited by hand, and textContent cannot be tricked into being HTML */
      b.appendChild(span("pl-num", String(i + 1).padStart(2, "0")));
      b.appendChild(span("", item.name || item.title));
      b.appendChild(span("pl-meta", fileMode ? (item.meta || "") : item.bpm + " BPM"));
      b.addEventListener("click", function(){ select(i); setIdx(false); });
      li.appendChild(b); elList.appendChild(li);
    });
    elNote.textContent = fileMode
      ? "Playing audio files served with this page."
      : "No files — every note is being synthesised in your browser right now.";
  }

  /* ---------- chiptune mode ----------
     Same transport, same window, different source: either the mp3s or the FM
     synthesiser. Switching pauses whatever is running, swaps the playlist and
     starts again from the top, so the two engines are never both audible. */
  function setChiptune(on){
    var want = !on;                       /* want files? */
    if(want === fileMode) return fileMode;
    if(want && !hasFiles) return fileMode;          /* nothing to switch to */
    var wasPlaying = playing;
    pause();
    if(audioEl) audioEl.pause();
    clearInterval(timer); timer = null;
    fileMode = want;
    refreshGraphNeed();
    LIST = fileMode ? USER_TRACKS : CH;
    plIdx = 0; elapsed = 0; stepIdx = 0; lastErr = "";
    elTime.textContent = "0:00";
    buildList();
    syncVolumeUi();
    if(fileMode && audioEl) setSrc(LIST[plIdx].src);
    if(wasPlaying) play(); else render();
    /* the terminal can flip the mode too, so keep the buttons truthful */
    if(typeof syncModeUi === "function") syncModeUi();
    return fileMode;
  }

  buildList();

  /* ----- visualiser + clock readout -----
     The loop only runs while the Player is open, audio is playing and the tab is
     visible. Otherwise it paints one static frame and stops scheduling entirely,
     so a backgrounded tab costs nothing. */
  var bins = new Uint8Array(64);
  var vizRAF = null;

  function vizAlive(){
    var w = wins.player;
    /* in flow mode every window carries .open, so folded must count as closed —
       otherwise the loop runs forever behind a collapsed section on mobile. */
    return w.classList.contains("open") && !w.classList.contains("folded")
           && playing && !document.hidden;
  }
  function startViz(){
    if(vizRAF !== null) return;
    if(!wins.player.classList.contains("open")) return;
    if(vizAlive()) vizRAF = requestAnimationFrame(frame);
    else drawViz();
  }
  function stopViz(){
    if(vizRAF !== null){ cancelAnimationFrame(vizRAF); vizRAF = null; }
  }
  function frame(now){
    vizRAF = null;
    tapeTick(now || performance.now());
    drawViz();
    if(vizAlive()) vizRAF = requestAnimationFrame(frame);
  }

  /* With no analyser (iOS file playback) there is no spectrum to read, so the
     bars get a cheap deterministic wiggle rather than standing dead. */
  function fakeLevel(i){
    var t = audioEl ? audioEl.currentTime : 0;
    var a = Math.sin(t * 2.1 + i * 0.70), b = Math.sin(t * 3.7 - i * 0.31);
    var env = 0.55 + 0.45 * Math.sin(t * 1.3 + i * 0.12);
    var v = (0.45 + 0.28 * a + 0.22 * b) * env * (1 - i / 48);
    return v < 0 ? 0 : (v > 1 ? 1 : v);
  }

  /* ---------- cassette ----------
     Tape length is proportional to pack AREA, so a pack's radius goes as
     sqrt(hub² + fraction·(full² − hub²)) — that is why a cassette's take-up
     reel starts fast and visibly slows as it fills. Angular speed is inversely
     proportional to radius, so each reel gets its own animation duration.
     Both are CSS custom properties: the compositor does the spinning. */
  var tapeEl = document.getElementById("plTape");

  var plStack = document.querySelector(".stack.pl");
  var HUB = 0.30, FULL = 0.86, tapeAt = -1, tapeT = 0;

  function progress(){
    if(fileMode){
      if(!audioEl) return 0;
      var d = audioEl.duration;
      if(!d || !isFinite(d) || d <= 0) return 0;
      return Math.min(1, Math.max(0, audioEl.currentTime / d));
    }
    /* the synthesiser loops rather than ending, so the tape runs a nominal side */
    return ac ? Math.min(1, ((ac.currentTime - startedAt) % 240) / 240) : 0;
  }

  function setTape(p){
    if(Math.abs(p - tapeAt) < 0.002) return;      /* nothing visible changed */
    tapeAt = p;
    var span = FULL * FULL - HUB * HUB;
    var ra = Math.sqrt(HUB * HUB + (1 - p) * span);   /* supply shrinks */
    var rb = Math.sqrt(HUB * HUB + p * span);         /* take-up grows  */
    tapeEl.style.setProperty("--pack-a", (ra * 100).toFixed(1) + "%");
    tapeEl.style.setProperty("--pack-b", (rb * 100).toFixed(1) + "%");
    /* constant tape speed: a bigger pack turns more slowly */
    tapeEl.style.setProperty("--spin-a", (ra * 2.6).toFixed(2) + "s");
    tapeEl.style.setProperty("--spin-b", (rb * 2.6).toFixed(2) + "s");
  }
  function tapeTick(now){
    if(now - tapeT < 180) return;                 /* ~5 Hz is plenty */
    tapeT = now;
    setTape(progress());
  }
  function syncTape(){
    plStack.classList.toggle("playing", !!playing);
    if(!playing) setTape(progress());
  }

  function drawViz(){
    if(!wins.player.classList.contains("open")) return;

    var W = elViz.clientWidth, H = elViz.clientHeight;
    if(!W || !H) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    if(elViz.width !== Math.round(W * dpr)){
      elViz.width = Math.round(W * dpr); elViz.height = Math.round(H * dpr);
    }
    vg.setTransform(dpr, 0, 0, dpr, 0, 0);
    vg.clearRect(0, 0, W, H);

    if(analyser) analyser.getByteFrequencyData(bins);
    else bins.fill(0);

    var n = 32, gap = 2, bw = Math.max(2, (W - gap * (n - 1)) / n);
    var cell = 4;
    for(var i = 0; i < n; i++){
      var v = analyser ? bins[i] / 255 : (playing ? fakeLevel(i) : 0);
      var lit = Math.round((v * H) / cell);
      var x = i * (bw + gap);
      for(var c = 0; c < Math.floor(H / cell); c++){
        var y = H - (c + 1) * cell;
        var on = c < lit;
        if(!on && !playing && c === 0) on = true;      /* idle floor line */
        if(!on){ vg.fillStyle = "rgba(255,255,255,.045)"; }
        else {
          var f = c / (H / cell);
          vg.fillStyle = f > 0.78 ? "#F5A657" : (f > 0.45 ? "#E85A9B" : "#6FD6E8");
        }
        vg.fillRect(Math.round(x), y, Math.round(bw), cell - 1);
      }
    }

    if(playing){
      var t = fileMode
        ? (audioEl ? audioEl.currentTime : 0)
        : (ac ? ac.currentTime - startedAt : 0);
      elTime.textContent = fmtTime(t);
    }
  }

  /* wake the loop whenever the player is focused, state changes, or the tab returns */
  var focusForViz = focus;
  focus = function(k){ focusForViz(k); if(k === "player") startViz(); };
  document.addEventListener("visibilitychange", function(){
    if(document.hidden) stopViz(); else startViz();
  });

  /* ----- start on open -----
     Browsers refuse to make sound until the visitor has interacted with the page,
     so we ask politely first; if we're refused, the next click or keypress
     anywhere starts it, and a taskbar button offers the same thing explicitly. */
  var armed = false, armGo = null;
  /* WebKit grants user activation on only some of these, and not the same ones
     as Blink, so we listen for the lot and let whichever iOS honours win. */
  var ARM_EV = ["pointerdown", "touchend", "click", "keydown"];

  function disarm(){
    if(!armGo) return;
    ARM_EV.forEach(function(ev){ document.removeEventListener(ev, armGo, true); });
    armGo = null;
    armHint.hidden = true;
    needsGesture = false;
    render();
  }
  function armGesture(){
    if(armed) return;
    armed = true;
    /* Runs synchronously inside the gesture: a browser only honours playback
       started while the user's activation is still live. Note that it does NOT
       disarm here — a tap iOS declines must not burn the listeners and take
       the "Enable sound" button down with it. disarm() happens in onPlayOk,
       once the element is genuinely playing. */
    armGo = function(){ play(); };
    ARM_EV.forEach(function(ev){ document.addEventListener(ev, armGo, true); });
  }
  /* A blocked AudioContext leaves resume() pending indefinitely rather than
     rejecting, so the state is polled instead of awaited. */
  function autostart(){
    armGesture();
    if(!useGraph){
      /* No context to unlock. Just ask; iOS will refuse until a gesture, and
         onPlayFail puts the "Enable sound" button up. */
      play();
      return;
    }
    initAudio();
    var r = ac.resume();
    if(r && r.then) r.then(function(){}, function(){});
    var tries = 0;
    (function check(){
      if(ac.state === "running"){ play(); return; }   /* onPlayOk disarms */
      if(++tries > 3){ if(armGo){ armHint.hidden = false; needsGesture = true; render(); } return; }
      setTimeout(check, 120);
    })();
  }
  armHint.addEventListener("click", function(){ disarm(); play(); });

  /* Dead controls are worse than absent ones: hide the sliders wherever a gain
     node is not actually in the path, and put them back when one is. */
  function syncVolumeUi(){
    var real = sliderWorks();
    var volRow = elVol.parentNode;
    if(volRow) volRow.hidden = !real;
    trayVol.hidden = !real;
    document.getElementById("volNote").hidden = real;
    applyGain();
  }
  syncVolumeUi();

  /* ----- source switch: files or the synthesiser ----- */
  /* ---------- the J-card index ----------
     The track list is no longer a panel under the player; it is an insert that
     folds out over the label and closes again once a track is chosen, so it
     costs the player no height at all. */
  var elIdx = document.getElementById("plIdx");
  function setIdx(open){
    elIdx.hidden = !open;
    elNo.setAttribute("aria-expanded", open ? "true" : "false");
  }
  elNo.addEventListener("click", function(e){ e.stopPropagation(); setIdx(elIdx.hidden); });
  document.getElementById("plIdxX").addEventListener("click", function(){ setIdx(false); elNo.focus(); });
  /* Escape is handled at the document, the same as the Start menu and the
     compose dialog — binding it to the panel missed, because focus stays on
     the button that opened it. */
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && !elIdx.hidden){ setIdx(false); elNo.focus(); }
  });
  document.addEventListener("click", function(e){
    if(!elIdx.hidden && !elIdx.contains(e.target) && e.target !== elNo) setIdx(false);
  });

  var mFile = document.getElementById("plModeFile");
  var mChip = document.getElementById("plModeChip");
  function syncModeUi(){
    mFile.setAttribute("aria-pressed", fileMode ? "true" : "false");
    mChip.setAttribute("aria-pressed", fileMode ? "false" : "true");
  }
  if(!hasFiles){
    mFile.disabled = true;
    mFile.title = "No audio files are listed for this page";
  }
  mFile.addEventListener("click", function(){ setChiptune(false); });
  mChip.addEventListener("click", function(){ setChiptune(true); });
  syncModeUi();

  applyGain();
  render();

