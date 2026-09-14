  /* ---------- start menu ---------- */
  var startBtn = document.getElementById("start"), menu = document.getElementById("startmenu");
  function closeStart(){ menu.classList.remove("open"); startBtn.setAttribute("aria-expanded","false"); }
  startBtn.addEventListener("click", function(e){
    e.stopPropagation();
    var isOpen = menu.classList.toggle("open");
    startBtn.setAttribute("aria-expanded", isOpen ? "true":"false");
    if(isOpen){ var f = menu.querySelector("button"); if(f) f.focus(); }
  });
  document.addEventListener("click", function(e){
    if(!menu.contains(e.target) && e.target !== startBtn) closeStart();
  });
  document.addEventListener("keydown", function(e){
    if(e.key !== "Escape") return;
    closeStart();
    if(!wrap.hidden) closeCompose();
  });

  /* ---------- compose dialog ---------- */
  var wrap = document.getElementById("composeWrap");
  var lastFocus = null;

  function openCompose(){
    lastFocus = document.activeElement;
    wrap.hidden = false;
    var f = wrap.querySelector(".dl");
    if(f) f.focus();
  }
  function closeCompose(){
    wrap.hidden = true;
    resetCopy();
    if(lastFocus && lastFocus.isConnected) lastFocus.focus();
  }

  document.getElementById("mailTrigger").addEventListener("click", openCompose);
  document.getElementById("dlgClose").addEventListener("click", closeCompose);
  document.getElementById("veil").addEventListener("click", closeCompose);
  Array.prototype.forEach.call(wrap.querySelectorAll("[data-close]"), function(a){
    a.addEventListener("click", function(){ setTimeout(closeCompose, 60); });
  });

  /* keep tabbing inside the dialog while it is up */
  wrap.addEventListener("keydown", function(e){
    if(e.key !== "Tab") return;
    var f = wrap.querySelectorAll("a[href],button");
    if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  /* copy to clipboard, with a select-the-text fallback */
  var copyBtn = document.getElementById("copyAddr"), copyTimer = null;
  function resetCopy(){
    if(copyTimer){ clearTimeout(copyTimer); copyTimer = null; }
    copyBtn.textContent = "Copy address";
  }
  function flash(msg){
    copyBtn.textContent = msg;
    copyTimer = setTimeout(resetCopy, 2000);
  }
  copyBtn.addEventListener("click", function(){
    var addr = wrap.querySelector(".addr").textContent.trim();
    function fallback(){
      try{
        var r = document.createRange();
        r.selectNodeContents(wrap.querySelector(".addr"));
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        flash(document.execCommand("copy") ? "Copied" : "Press Ctrl+C");
      }catch(err){ flash("Press Ctrl+C"); }
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(addr).then(function(){ flash("Copied"); }, fallback);
    } else { fallback(); }
  });

  /* ---------- clock ---------- */
  var clock = document.getElementById("clock");
  function tick(){
    var d = new Date();
    var h = d.getHours(), m = String(d.getMinutes()).padStart(2,"0");
    /* clockShift is declared later in the same scope and is normally undefined;
       set to a UTC offset it sends the tray clock to another city. */
    if(typeof clockShift === "number"){
      var t = new Date(d.getTime() + d.getTimezoneOffset() * 60000 + clockShift * 3600000);
      h = t.getHours(); m = String(t.getMinutes()).padStart(2,"0");
      clock.textContent = String(h).padStart(2,"0") + ":" + m + " JST";
      return;
    }
    var ap = h >= 12 ? "PM":"AM"; h = h % 12 || 12;
    clock.textContent = h + ":" + m + " " + ap;
  }
  tick(); setInterval(tick, 15000);

