  /* ---------- boot ---------- */
  loadHigh();
  buildLevel();
  pac = makePac(); ghosts = makeGhosts();
  setState(STATE.MENU);
  document.addEventListener("keydown", onKey, false);
  draw();
}

  /* ---------- Pac-Man: one lazily-built instance, parked when out of sight --- */
  var pacApp = null, pacPadBound = false, pacVisible = true;
  var pacWin = wins.pacman;

  function pacOnScreen(){
    if(!pacWin.classList.contains("open")) return false;
    if(pacWin.classList.contains("folded")) return false;
    if(document.hidden) return false;
    /* on the desktop the game only runs while its window is in front; in the
       mobile stack that means unfolded and actually scrolled into view */
    return isFlow() ? pacVisible : pacWin.classList.contains("focused");
  }
  /* Keys only reach the game when its window is the one in front (or, in the
     mobile stack, when it is the section unfolded). Everything else on the
     page keeps its own shortcuts. */
  function pacHasFocus(){
    if(!pacOnScreen()) return false;
    return isFlow() ? true : pacWin.classList.contains("focused");
  }

  function pacEnsure(){
    if(pacApp) return pacApp;
    pacApp = new PacmanApp({
      canvas: document.getElementById("pacCv"),
      view: document.getElementById("pacView"),
      hud: {
        score: document.getElementById("pacScore"),
        high:  document.getElementById("pacHigh"),
        level: document.getElementById("pacLevel"),
        lives: document.getElementById("pacLives"),
        msg:   document.getElementById("pacMsg"),
        msgWrap: document.getElementById("pacMsgWrap")
      },
      /* borrows the player's context when there is one; never makes its own */
      getAudioContext: function(){ return ac; },
      isVisible: pacOnScreen,
      /* declared in 97-eggs.js, which runs before anyone can reach level 3 */
      onLevel: function(n){ if(typeof eggPacLevel === "function") eggPacLevel(n); },
      hasFocus: pacHasFocus,
      flow: isFlow,
      reduced: reduced
    });
    if(!pacPadBound){
      pacPadBound = true;
      Array.prototype.forEach.call(document.querySelectorAll(".pac-dir"), function(b){
        b.addEventListener("click", function(){ pacApp.press(b.dataset.dir); });
      });
      document.getElementById("pacStart").addEventListener("click", function(){ pacApp.start(); });
      document.getElementById("pacPause").addEventListener("click", function(){ pacApp.togglePause(); });
      var sb = document.getElementById("pacSound");
      sb.addEventListener("click", function(){
        if(!pacApp.soundAvailable()){
          sb.textContent = "SOUND N/A";
          sb.disabled = true;
          return;
        }
        var on = pacApp.setSound(sb.getAttribute("aria-pressed") !== "true");
        sb.setAttribute("aria-pressed", on ? "true" : "false");
        sb.textContent = on ? "SOUND ON" : "SOUND";
      });
      /* swipe anywhere on the board */
      var cv = document.getElementById("pacCv"), sx = 0, sy = 0, sactive = false;
      cv.addEventListener("touchstart", function(e){
        var t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; sactive = true;
      }, {passive:true});
      cv.addEventListener("touchend", function(e){
        if(!sactive) return;
        sactive = false;
        var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
        if(Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
        pacApp.press(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left")
                                                 : (dy > 0 ? "down" : "up"));
      }, {passive:true});
    }
    return pacApp;
  }

  function pacSync(){
    if(pacOnScreen()) pacEnsure().resume();
    else if(pacApp) pacApp.suspend();
  }

  /* In the stack a section can be unfolded but scrolled far off screen; the
     ghosts should not be hunting a board nobody is looking at. */
  if(window.IntersectionObserver){
    new IntersectionObserver(function(ents){
      if(!pacApp || !isFlow()) return;
      pacVisible = ents[0].isIntersecting;
      pacSync();
    }, {threshold:0.2}).observe(pacWin);
  }

  /* open() is the single entry point every icon, menu item and command uses */
  var openBeforePac = open;
  open = function(k){
    openBeforePac(k);
    if(k === "pacman") setTimeout(pacSync, 0);
    else if(pacApp) pacSync();
  };
  /* clicking another window routes through focus(), not open() */
  var focusBeforePac = focus;
  focus = function(k){ focusBeforePac(k); if(pacApp) pacSync(); };
  pacWin.querySelector('[data-act="close"]').addEventListener("click", pacSync);
  pacWin.querySelector('[data-act="min"]').addEventListener("click", pacSync);
  document.addEventListener("visibilitychange", pacSync);
  window.addEventListener("resize", function(){ if(pacApp) pacApp.redraw(); });
  /* maximize, edge-drag resize and folding all change the frame without firing
     a window resize event, so watch the window itself */
  if(window.ResizeObserver){
    new ResizeObserver(function(){ if(pacApp) pacApp.redraw(); }).observe(pacWin);
  }

  /* ---------- Recruiter View ----------
     Now just another window, so opening it goes through the normal OS path.
     The only special behaviour is audio: pause on open, and restore ONLY the
     state the visitor had before (never unmute something they muted). */
  var wasPlayingBeforeRecruiter = false;

  /* Routing every caller through here means the icon, the Start menu, the
     mobile nav link and the terminal all get the same behaviour, with no
     special-casing at any of the call sites. */
  var openBeforeRecruiter = open;
  open = function(k){
    if(k === "recruiter"){ openRecruiter(); return; }
    openBeforeRecruiter(k);
  };

  function openRecruiter(){
    var alreadyOpen = wins.recruiter.classList.contains("open");
    if(!alreadyOpen){
      wasPlayingBeforeRecruiter = playing && !muted;
      pause();
    }
    openBeforeRecruiter("recruiter");
    /* in the mobile stack a window can be open but collapsed — opening it from
       the notification has to actually reveal the content */
    if(isFlow()) setFold("recruiter", false);
    markQqRead();
    if(location.hash !== "#recruiter") history.replaceState(null, "", "#recruiter");
  }

  function onRecruiterClosed(){
    if(location.hash === "#recruiter") history.replaceState(null, "", location.pathname);
    if(wasPlayingBeforeRecruiter && !muted) play();
    wasPlayingBeforeRecruiter = false;
  }

  wins.recruiter.querySelector('[data-act="close"]')
    .addEventListener("click", onRecruiterClosed);

  window.addEventListener("popstate", function(){
    if(location.hash === "#recruiter") openRecruiter();
  });

