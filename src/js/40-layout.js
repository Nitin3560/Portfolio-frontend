  /* ---------- layout mode ---------- */
  function layoutDesktop(){
    var vw = window.innerWidth, vh = window.innerHeight - 64;
    Object.keys(wins).forEach(function(k){
      var w = wins[k], d = w.dataset;
      if(w.classList.contains("maxed")) return;
      var ww = Math.min(+d.w, vw - 40);
      var hh = Math.min(+d.h, vh - 40);
      w.style.width = ww + "px";
      w.style.height = hh + "px";
      w.style.left = Math.min(+d.x, Math.max(10, vw - ww - 20)) + "px";
      w.style.top  = Math.min(+d.y, Math.max(10, vh - hh - 10)) + "px";
    });
  }
  function applyMode(){
    var flow = window.innerWidth < BP;
    document.body.classList.toggle("flow", flow);
    if(flow){
      Object.keys(wins).forEach(function(k){
        var w = wins[k];
        /* Recruiter View is a condensed repeat of everything below it, so it
           stays closed in the stack — the nav link and icon open it on demand. */
        if(k !== "recruiter" && k !== "attic" && k !== "dex") w.classList.add("open");
        w.classList.remove("maxed");
        setFold(k, k !== "about");
        w.querySelector(".titlebar .t").setAttribute("aria-hidden", "true");
        var mb = w.querySelector('[data-act="max"]');
        mb.dataset.state = "max";
        mb.setAttribute("aria-label", "Maximize " + LABEL[k]);
        w.style.left = w.style.top = w.style.width = w.style.height = "";
      });
      Object.keys(wins).forEach(function(k){ wins[k].classList.remove("focused"); });
    } else {
      Object.keys(wins).forEach(function(k){
        setFold(k, false);
        wins[k].classList.remove("open", "focused");   /* flow opened all nine */
        wins[k].querySelector(".titlebar .t").removeAttribute("aria-hidden");
      });
      layoutDesktop();
      /* The desktop starts quiet: only the Player. README and Projects are a
         double-click away on the icons, so the visitor chooses what to open. */
      ["player"].forEach(function(k){ open(k); });
    }
    syncTasks();
    mnavHint();
  }

  var lastFlow = null;
  function onResize(){
    var flow = window.innerWidth < BP;
    if(flow !== lastFlow){ lastFlow = flow; applyMode(); }
    else if(!flow){
      Object.keys(wins).forEach(function(k){
        var w = wins[k];
        var r = w.getBoundingClientRect();
        if(r.left > window.innerWidth - 90) w.style.left = (window.innerWidth - 200) + "px";
      });
    }
    drawWall();
  }
  window.addEventListener("resize", onResize);

