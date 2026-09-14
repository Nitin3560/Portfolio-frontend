  /* ---------- boot ---------- */
  var boot = document.getElementById("boot");
  var LINES = [
    '<span class="hi">HY-OS</span>  v1.0  &mdash;  personal system',
    'Brooklyn, NY  &middot;  build 2026.05',
    '',
    'Checking memory ................ 640K OK',
    'Mounting /education ............ NYU, UW',
    'Mounting /experience ........... 1 role',
    'Loading /projects .............. 3 items',
    'Starting network ............... <span class="mg">hy3169@nyu.edu</span>',
    '',
    'Ready.'
  ];
  /* ---------- attract mode ----------
     Idle long enough and the desktop does what an arcade cabinet does. It is
     pure CSS once shown, so an unattended tab still schedules no frames; the
     only cost while waiting is one timer that gets reset by activity. */
  var attract = document.getElementById("attract");
  var atScroll = document.getElementById("atScroll");
  var atHigh = document.getElementById("atHigh");
  var IDLE_MS = 60000;
  var idleTimer = null, attractOn = false;

  var AT_LINES = [
    "ＨＹ－ＯＳ　１．０",
    "M.S. COMPUTER ENGINEERING · NYU · MAY 2026",
    "BACKEND · AWS · KUBERNETES · APPLIED AI",
    "ＡＩＦＲＩＥＮＤＳ　—　AGENTIC RAG, TOKEN-BY-TOKEN STREAMING",
    "ＳＭＡＲＴ　ＰＨＯＴＯ　ＡＬＢＵＭ　—　SERVERLESS IMAGE SEARCH",
    "ＤＩＮＩＮＧ　ＣＯＮＣＩＥＲＧＥ　—　1,600+ MANHATTAN RESTAURANTS",
    "ＰＡＣ－ＭＡＮ　プレイできます",
    "SEEKING SWE ROLES FROM MAY 2026 · hy3169@nyu.edu",
    "タッチして　つづける"
  ];

  function attractBusy(){
    /* never cover something the visitor is watching or filling in */
    if(isFlow()) return true;                       /* the phone stack is a page, not a screen */
    if(!wrap.hidden) return true;                   /* compose dialog is open */
    if(!document.getElementById("fdWrap").hidden) return true;
    if(typeof pacApp !== "undefined" && pacApp && pacApp.state() === "playing") return true;
    var a = document.activeElement;
    if(a && (a.nodeName === "INPUT" || a.nodeName === "TEXTAREA" || a.isContentEditable)) return true;
    return false;
  }

  function showAttract(){
    if(attractOn || reduced) return;
    if(attractBusy()){
      /* Busy now, but the dialog will close eventually. Look again later rather
         than giving up — bailing outright means attract mode never returns. */
      idleTimer = setTimeout(showAttract, 10000);
      return;
    }
    attractOn = true;
    atHigh.textContent = readHighScore();
    atScroll.textContent = AT_LINES.join("　　·　　") + "　　·　　";
    attract.hidden = false;
  }
  function hideAttract(){
    if(!attractOn) return;
    attractOn = false;
    attract.classList.add("out");
    setTimeout(function(){ attract.hidden = true; attract.classList.remove("out"); }, 220);
  }
  function readHighScore(){
    try{
      var v = window.localStorage.getItem("pacman_high_score");
      return String(parseInt(v, 10) || 0).padStart(6, "0");
    }catch(e){ return "000000"; }
  }
  function poke(){
    /* Dismissing must also re-arm — otherwise attract mode appears exactly once
       per page load and never again. */
    if(attractOn) hideAttract();
    clearTimeout(idleTimer);
    if(reduced) return;
    idleTimer = setTimeout(showAttract, IDLE_MS);
  }
  ["pointerdown","pointermove","keydown","wheel","touchstart","focusin","click"].forEach(function(ev){
    document.addEventListener(ev, poke, {passive:true, capture:true});
  });
  document.addEventListener("visibilitychange", function(){
    if(document.hidden){ clearTimeout(idleTimer); } else { poke(); }
  });
  attract.addEventListener("click", hideAttract);

  function start(){
    lastFlow = window.innerWidth < BP;
    applyMode();
    drawWall();
    autostart();
    focusOnOpen = true;   /* from here on, opening a window moves focus into it */
    /* the message arrives a beat after the desktop settles — unless they
       followed a #recruiter link, in which case it is already answered */
    if(location.hash !== "#recruiter") qqTimer = setTimeout(showQq, reduced ? 1200 : 2800);
    poke();                       /* arm the attract-mode idle timer */
    if(location.hash === "#recruiter") openRecruiter();
  }
  if(reduced){
    boot.remove(); start();
  } else {
    var i = 0;
    (function step(){
      if(i < LINES.length){
        var p = document.createElement("div");
        p.innerHTML = LINES[i] || "&nbsp;";
        boot.appendChild(p);
        i++;
        setTimeout(step, i === 1 ? 260 : 105);
      } else {
        setTimeout(function(){
          boot.classList.add("done");
          setTimeout(function(){ boot.remove(); }, 500);
        }, 320);
      }
    })();
    boot.addEventListener("click", function(){ boot.classList.add("done"); setTimeout(function(){ boot.remove(); }, 460); });
    start();
  }
})();
</script>
