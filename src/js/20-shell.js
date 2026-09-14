  /* ---------- desktop icons + start menu ---------- */
  var iconWrap = document.getElementById("icons");
  var startList = document.getElementById("startlist");
  function deskIcon(k){
    var b = document.createElement("button");
    b.className = "icon"; b.type = "button";
    b.innerHTML = ART[k] + "<span>" + LABEL[k] + "</span>";
    b.addEventListener("dblclick", function(){ open(k); });
    b.addEventListener("click", function(e){ if(e.detail === 0) open(k); });
    b.addEventListener("keydown", function(e){
      if(e.key === "Enter" || e.key === " "){ e.preventDefault(); open(k); }
    });
    iconWrap.appendChild(b);
  }
  function menuItem(k){
    var li = document.createElement("li");
    var mb = document.createElement("button");
    mb.type = "button"; mb.setAttribute("role","menuitem");
    mb.innerHTML = ART[k] + "<span>" + LABEL[k] + "</span>";
    mb.addEventListener("click", function(){ closeStart(); open(k); });
    li.appendChild(mb); startList.appendChild(li);
  }
  function linkIcon(L){
    var a = document.createElement("a");
    a.className = "icon"; a.href = L.url;
    a.target = "_blank"; a.rel = "noopener noreferrer";
    a.innerHTML = ART[L.k] + "<span>" + L.label + "</span>";
    iconWrap.appendChild(a);
  }

  WORK.forEach(deskIcon);
  LINKS.forEach(linkIcon);          /* GitHub and LinkedIn sit with the work */
  PLAY.forEach(deskIcon);

  ORDER.forEach(menuItem);
  var sep = document.createElement("li"); sep.className = "sep"; startList.appendChild(sep);

  LINKS.forEach(function(L){
    var li = document.createElement("li");
    var ma = document.createElement("a");
    ma.href = L.url; ma.target = "_blank"; ma.rel = "noopener noreferrer";
    ma.setAttribute("role", "menuitem");
    ma.innerHTML = ART[L.k] + "<span>" + L.label + "</span>";
    ma.addEventListener("click", closeStart);
    li.appendChild(ma); startList.appendChild(li);
  });

  var liMail = document.createElement("li");
  var mail = document.createElement("button");
  mail.type = "button"; mail.setAttribute("role", "menuitem");
  mail.innerHTML = ART.contact + "<span>Send mail&hellip;</span>";
  mail.addEventListener("click", function(){ closeStart(); openCompose(); });
  liMail.appendChild(mail); startList.appendChild(liMail);

  /* ---------- taskbar ---------- */
  Array.prototype.forEach.call(document.querySelectorAll("[data-ico]"), function(a){
    a.insertAdjacentHTML("afterbegin", ART[a.dataset.ico]);
  });

  var tasks = document.getElementById("tasks");
  var taskBtns = {};
  function syncTasks(){
    ALLWINS.forEach(function(k){
      var w = wins[k];
      var isOpen = w.classList.contains("open") && !w.classList.contains("crt-off");
      var b = taskBtns[k];
      if(isOpen && !b){
        b = document.createElement("button");
        b.className = "task"; b.type = "button"; b.textContent = LABEL[k];
        b.addEventListener("click", function(){
          if(w.classList.contains("focused")) { hide(k); } else { focus(k); }
        });
        tasks.appendChild(b); taskBtns[k] = b;
      } else if(!isOpen && b){
        b.remove(); delete taskBtns[k];
      }
      if(taskBtns[k]) taskBtns[k].setAttribute("aria-pressed", w.classList.contains("focused") ? "true":"false");
    });
  }

  function isFlow(){ return document.body.classList.contains("flow"); }

  function focus(k){
    Object.keys(wins).forEach(function(n){ wins[n].classList.remove("focused"); });
    var w = wins[k];
    /* if it is still collapsing from a close, cancel that and bring it back */
    if(w.classList.contains("crt-off")){
      clearTimeout(crtTimers[k]);
      w.classList.remove("crt-off");
    }
    w.classList.add("open","focused");
    if(!isFlow()){ z += 1; w.style.zIndex = z; }
    else { w.scrollIntoView({behavior: reduced ? "auto":"smooth", block:"start"}); }
    syncTasks();
  }
  function open(k){ focus(k); }
  function hide(k){
    wins[k].classList.remove("focused");
    if(!isFlow()) wins[k].classList.remove("open");
    syncTasks();
  }
  var crtTimers = {};
  function close(k){
    var w = wins[k];
    /* In the mobile stack windows are sections in a scroll, not screens, and a
       CRT collapse there would just look like a layout bug. */
    if(reduced || isFlow() || !w.classList.contains("open")){
      w.classList.remove("open", "focused", "crt-off");
      syncTasks();
      return;
    }
    w.classList.remove("focused");
    w.classList.add("crt-off");
    syncTasks();                     /* the taskbar button goes at once */
    clearTimeout(crtTimers[k]);
    crtTimers[k] = setTimeout(function(){
      w.classList.remove("crt-off", "open");
      syncTasks();
    }, 280);
  }

  Object.keys(wins).forEach(function(k){
    var w = wins[k];
    w.addEventListener("mousedown", function(){ if(!isFlow() && !w.classList.contains("focused")) focus(k); });
    w.querySelector('[data-act="close"]').addEventListener("click", function(e){ e.stopPropagation(); close(k); });
    w.querySelector('[data-act="min"]').addEventListener("click", function(e){ e.stopPropagation(); hide(k); });

    /* maximize / restore */
    var maxBtn = w.querySelector('[data-act="max"]');
    function toggleMax(){
      if(isFlow()) return;
      var on = w.classList.toggle("maxed");
      if(on){
        w._pre = {l:w.style.left, t:w.style.top, w:w.style.width, h:w.style.height};
      } else if(w._pre){
        w.style.left = w._pre.l; w.style.top = w._pre.t;
        w.style.width = w._pre.w; w.style.height = w._pre.h;
      }
      maxBtn.dataset.state = on ? "restore" : "max";
      maxBtn.setAttribute("aria-label", (on ? "Restore " : "Maximize ") + LABEL[k]);
      focus(k);
    }
    maxBtn.addEventListener("click", function(e){ e.stopPropagation(); toggleMax(); });

    /* resize handles */
    ["n","s","e","w","ne","nw","se","sw"].forEach(function(dir){
      var h = document.createElement("div");
      h.className = "rz " + dir; h.dataset.dir = dir;
      w.appendChild(h);
      h.addEventListener("pointerdown", function(e){
        if(isFlow() || w.classList.contains("maxed")) return;
        e.preventDefault(); e.stopPropagation();
        focus(k);
        var r = w.getBoundingClientRect();
        var sx = e.clientX, sy = e.clientY;
        var MINW = 320, MINH = 190, floor = window.innerHeight - 64;
        h.setPointerCapture(e.pointerId);
        function move(ev){
          var dx = ev.clientX - sx, dy = ev.clientY - sy;
          var L = r.left, T = r.top, WW = r.width, HH = r.height;
          if(dir.indexOf("e") > -1) WW = r.width + dx;
          if(dir.indexOf("s") > -1) HH = r.height + dy;
          if(dir.indexOf("w") > -1){ WW = r.width - dx;  L = r.left + dx; }
          if(dir.indexOf("n") > -1){ HH = r.height - dy; T = r.top + dy; }
          if(WW < MINW){ if(dir.indexOf("w") > -1) L = r.right - MINW; WW = MINW; }
          if(HH < MINH){ if(dir.indexOf("n") > -1) T = r.bottom - MINH; HH = MINH; }
          L = Math.max(0, L); T = Math.max(0, T);
          WW = Math.min(WW, window.innerWidth - L);
          HH = Math.min(HH, floor - T);
          w.style.left = L + "px"; w.style.top = T + "px";
          w.style.width = WW + "px"; w.style.height = HH + "px";
        }
        function up(){
          h.removeEventListener("pointermove", move);
          h.removeEventListener("pointerup", up);
          h.removeEventListener("pointercancel", up);
        }
        h.addEventListener("pointermove", move);
        h.addEventListener("pointerup", up);
        h.addEventListener("pointercancel", up);
      });
    });

    /* drag by titlebar */
    var bar = w.querySelector(".titlebar");
    bar.addEventListener("dblclick", function(e){
      if(e.target.closest("button")) return;
      toggleMax();
    });
    bar.addEventListener("pointerdown", function(e){
      if(isFlow() || w.classList.contains("maxed") || e.target.closest("button")) return;
      focus(k);
      var r = w.getBoundingClientRect();
      var dx = e.clientX - r.left, dy = e.clientY - r.top;
      bar.setPointerCapture(e.pointerId);
      function move(ev){
        var nx = Math.min(Math.max(0, ev.clientX - dx), window.innerWidth - 90);
        var ny = Math.min(Math.max(0, ev.clientY - dy), window.innerHeight - 44);
        w.style.left = nx + "px"; w.style.top = ny + "px";
      }
      function up(){
        bar.removeEventListener("pointermove", move);
        bar.removeEventListener("pointerup", up);
        bar.removeEventListener("pointercancel", up);
      }
      bar.addEventListener("pointermove", move);
      bar.addEventListener("pointerup", up);
      bar.addEventListener("pointercancel", up);
    });
  });

