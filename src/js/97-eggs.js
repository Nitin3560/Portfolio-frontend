  /* ---------- the hidden layer ----------
     Ten things that are on no menu. Every one of them is decoration: nothing
     here talks to a network, authenticates anything, or reads anything about
     the visitor. The single value written to storage is the list of ids
     already found, so the board survives a reload — same drawer as the
     Pac-Man high score, and just as uninteresting to anyone else.

     It reuses what the desktop already has: the terminal is the terminal
     (there is no second one), the tape deck is the tape deck (there is no
     second player), and CRT mode turns up the scanline overlay that was
     always on screen rather than laying a new one over it. */

  var EGGS = [
    ["konami",   "KONAMI",     "The code from every cabinet still works here."],
    ["tape",     "B-SIDE",     "A fourth tape that was never printed on the J-card."],
    ["crt",      "CRT",        "The monitor is twenty years older than it looks."],
    ["root",     "ROOT",       "Ask for permission often enough and the shell relents."],
    ["hidden",   "NSRSH",       "The shell has a flag it does not advertise."],
    ["maze",     "MAZE",       "Clear a whole maze. All 240 pellets, four ghosts."],
    ["midnight", "03:17 AM",   "Be here in the small hours, local time."],
    ["tokyo",    "TOKYO",      "The tray clock keeps another city's time."],
    ["attic",    "ATTIC",      "A room on this desktop with no icon and no door."],
    ["panic",    "KERNEL",     "Ask the machine, politely, to delete itself."],
    ["signal",   "SIGNAL",     "Something is living in the neon on the skyline."]
  ];
  var EGG_BY_ID = {};
  EGGS.forEach(function(e){ EGG_BY_ID[e[0]] = {name:e[1], hint:e[2]}; });

  var KEY = "nsros_eggs";
  var eggsFound = {};
  (function loadEggs(){
    try{
      var raw = window.localStorage.getItem(KEY) || "";
      raw.split(",").forEach(function(id){ if(EGG_BY_ID[id]) eggsFound[id] = true; });
    }catch(e){}                                   /* private mode: start fresh */
  })();
  function saveEggs(){
    try{ window.localStorage.setItem(KEY, Object.keys(eggsFound).join(",")); }catch(e){}
  }
  function eggCount(){ return Object.keys(eggsFound).length; }

  /* ---------- the toast ---------- */
  var eggBox = document.getElementById("egg");
  var eggT = document.getElementById("eggT"), eggN = document.getElementById("eggN");
  var eggD = document.getElementById("eggD"), eggC = document.getElementById("eggC");
  var eggBar = document.getElementById("eggBar");
  var eggTimer = null;

  function hideToast(){ clearTimeout(eggTimer); eggBox.hidden = true; }
  document.getElementById("eggX").addEventListener("click", hideToast);

  function toast(title, name, desc){
    eggT.textContent = title;
    eggN.textContent = name;
    eggD.textContent = desc;
    var n = eggCount(), tot = EGGS.length;
    eggC.textContent = n + " / " + tot;
    eggBar.style.width = Math.round(n / tot * 100) + "%";
    eggBox.hidden = false;
    clearTimeout(eggTimer);
    eggTimer = setTimeout(hideToast, 7000);
  }

  /* found() is idempotent: re-doing a trick you already know is silent. */
  function found(id){
    if(eggsFound[id]) return false;
    var e = EGG_BY_ID[id];
    if(!e) return false;
    eggsFound[id] = true;
    saveEggs();
    toast("Hidden layer", e.name, e.hint);
    paintBoard();
    if(eggCount() === EGGS.length){
      setTimeout(function(){
        toast("Hidden layer", "COMPLETE", "All " + EGGS.length + " of them. Type " +
          "“nsrsh --hidden” in the terminal for the board.");
      }, 7400);
    }
    return true;
  }

  /* ---------- 1. Konami ---------- */
  var KON = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown",
             "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  var konAt = 0;
  document.addEventListener("keydown", function(e){
    var t = e.target;
    if(t && (t.nodeName === "INPUT" || t.nodeName === "TEXTAREA" || t.isContentEditable)) return;
    /* the arrows belong to Pac-Man while Pac-Man is the window in front */
    if(typeof pacHasFocus === "function" && pacHasFocus()) return;
    var want = KON[konAt];
    var k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if(k === want){
      konAt++;
      if(konAt === KON.length){ konAt = 0; unlockTape(); }
    } else {
      konAt = (k === KON[0]) ? 1 : 0;
    }
  }, false);

  /* ---------- 2. the fourth tape ----------
     Not a second music player: one more entry pushed onto the synthesiser's
     own playlist, played by the deck that was already there. */
  var TAPE = {
    name:"03:17 AM", bpm:76, swing:0.09, hatEvery:4,
    kick:[0,10], snare:[8], bass:[0,6,10,14], stabs:[2,10],
    roots:[33,35,36,38,33,35,40,38],
    prog:[[58,61,65,68],[60,63,67,70],[60,64,67,71],[62,65,69,72],
          [58,61,65,68],[60,63,67,70],[59,64,68,71],[62,65,69,72]]
  };
  var tapeOut = false;
  function unlockTape(){
    if(!tapeOut){
      tapeOut = true;
      CH.push(TAPE);
      if(!fileMode) buildList();               /* the index is showing CH right now */
    }
    if(!found("konami") && !eggsFound.tape){
      toast("Hidden layer", "KONAMI", EGG_BY_ID.konami.hint);
    }
  }

  /* the egg lands when the tape is actually played, not when it appears */
  var playBefore = play;
  play = function(){
    playBefore();
    if(!fileMode && LIST[plIdx] === TAPE) found("tape");
  };

  /* ---------- 3. CRT mode ---------- */
  var crtOn = false;
  function setCrt(on){
    crtOn = !!on;
    document.documentElement.classList.toggle("crt", crtOn);
    if(crtOn) found("crt");
    return crtOn;
  }
  document.addEventListener("keydown", function(e){
    if(!e.ctrlKey || !e.altKey || e.metaKey) return;
    if((e.key || "").toLowerCase() !== "c") return;
    e.preventDefault();
    setCrt(!crtOn);
  }, false);

  /* ---------- 4. midnight ---------- */
  (function midnight(){
    var h = new Date().getHours();
    if(h >= 0 && h < 5){
      document.documentElement.classList.add("midnight");
      setTimeout(function(){ found("midnight"); }, 3600);
    }
  })();

  /* ---------- 5. the tray clock goes to Tokyo ----------
     clockShift is read by the clock in the taskbar. It is declared here and
     hoisted, so the tick() that runs long before this line simply sees
     undefined and keeps local time. */
  var clockShift = null;
  var clockHits = 0, clockTimer = null;
  document.getElementById("clock").addEventListener("click", function(){
    clockHits++;
    clearTimeout(clockTimer);
    clockTimer = setTimeout(function(){ clockHits = 0; }, 2400);
    if(clockHits < 5) return;
    clockHits = 0;
    clockShift = (clockShift === null) ? 9 : null;    /* JST does not shift */
    tick();
    if(clockShift !== null) found("tokyo");
  });

  /* ---------- 6. Pac-Man, level 3 ----------
     Called by the game when it rolls the level over; see 90-pacman.js. */
  function eggPacLevel(n){ if(n >= 2) found("maze"); }   /* level 2 = maze 1 cleared */

  /* ---------- 7. the attic ---------- */
  var atticSys = document.getElementById("atticSys");
  var atticBoard = document.getElementById("atticEggs");
  var atticFoot = document.getElementById("atticFoot");

  function fmt(n){ return String(n); }
  function sysReport(){
    var d = document.documentElement;
    var lines = [
      ["build",     "NSR-OS 1.0 · one static file, no framework, no backend"],
      ["source",    "36 hand-split parts, concatenated at build time"],
      ["document",  fmt(Math.round(d.outerHTML.length / 1024)) + " KB in this tab"],
      ["viewport",  fmt(window.innerWidth) + " × " + fmt(window.innerHeight) +
                    " @ " + (window.devicePixelRatio || 1) + "×"],
      ["renderer",  "canvas 2d · wallpaper, visualiser, maze"],
      ["audio",     ac ? ("WebAudio " + ac.state + " · " +
                          (fileMode ? "file" : "FM synthesis")) : "not started"],
      ["storage",   "2 keys · high score, hidden layer"],
      ["network",   "0 requests after load"],
      ["uptime",    typeof uptime === "function" ? uptime() : "—"],
      ["hidden",    eggCount() + " of " + EGGS.length + " found"]
    ];
    return lines.map(function(l){
      return "<b>" + l[0] + "</b>" + "        ".slice(0, Math.max(1, 10 - l[0].length)) + l[1];
    }).join("\n");
  }

  function paintBoard(){
    if(!atticBoard) return;
    atticBoard.innerHTML = "";
    EGGS.forEach(function(e){
      var got = !!eggsFound[e[0]];
      var row = document.createElement("div");
      row.className = "egg-row" + (got ? "" : " locked");
      var m = document.createElement("span"); m.className = "mark";
      m.textContent = got ? "◆" : "◇";
      var nm = document.createElement("span"); nm.className = "nm";
      nm.textContent = got ? e[1] : "———";
      var ds = document.createElement("span"); ds.className = "ds";
      ds.textContent = e[2];
      row.appendChild(m); row.appendChild(nm); row.appendChild(ds);
      atticBoard.appendChild(row);
    });
    if(atticFoot) atticFoot.textContent = eggCount() + " of " + EGGS.length + " found";
  }
  paintBoard();

  /* summoning a hushed window puts it back into the mobile stack, unfolded;
     closing it takes it out again, so it never lingers where nothing points */
  function hush(k, on){
    var w = wins[k];
    if(!w || !w.hasAttribute("data-hush")) return;
    w.classList.toggle("hush", !!on);
    if(!on && typeof setFold === "function" && isFlow()) setFold(k, false);
  }

  var openBeforeEggs = open;
  open = function(k){
    hush(k, false);
    if(k === "attic"){
      atticSys.innerHTML = sysReport();
      paintBoard();
    }
    openBeforeEggs(k);
    if(k === "attic") found("attic");
  };

  var closeBeforeEggs = close;
  close = function(k){ closeBeforeEggs(k); hush(k, true); };

  /* a way in that is not a command: the spine of the Start menu */
  (function spine(){
    var sp = document.querySelector("#startmenu .spine");
    if(!sp) return;
    var hits = 0, t = null;
    sp.addEventListener("click", function(){
      hits++;
      clearTimeout(t);
      t = setTimeout(function(){ hits = 0; }, 1600);
      if(hits < 3) return;
      hits = 0;
      closeStart();
      open("attic");
    });
  })();

  /* ---------- 8. the joke crash ---------- */
  var panicWrap = document.getElementById("panicWrap");
  var panicLast = null;
  function openPanic(){
    panicLast = document.activeElement;
    panicWrap.hidden = false;
    document.getElementById("panicOk").focus();
    found("panic");
  }
  function closePanic(){
    panicWrap.hidden = true;
    if(panicLast && panicLast.focus) panicLast.focus();
  }
  document.getElementById("panicOk").addEventListener("click", closePanic);
  document.getElementById("panicX").addEventListener("click", closePanic);
  document.getElementById("panicVeil").addEventListener("click", closePanic);
  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && !panicWrap.hidden) closePanic();
  }, false);

  /* ---------- 9 + 10. the shell knows more than help says ----------
     No second terminal, no authentication, no root: sudo is a running joke
     that eventually gives up and prints a longer joke. */
  var sudoTries = 0, devMode = false;

  function enterDev(){
    if(devMode) return;
    devMode = true;
    PS1 = "root@nsr-os:~#";
    var ps = document.getElementById("ps1");
    if(ps) ps.textContent = PS1;
    found("root");
  }

  CMD.sudo = function(args){
    var rest = (args || []).join(" ").trim().toLowerCase();
    if(rest === "rm -rf /" || rest === "rm -rf /*"){
      say("removing /  …", "dim");
      setTimeout(openPanic, 700);
      return;
    }
    sudoTries++;
    if(sudoTries === 1){
      say("nice try. this account has no sudoers entry.", "dim");
    } else if(sudoTries === 2){
      say("still no. the sudoers file is a print-out on my desk.", "dim");
    } else if(sudoTries === 3){
      say("[sudo] password for guest: <b>••••••••</b>", "dim");
      say("");
      say("fine. you clearly want this more than I want to stop you.", "head");
      say("developer mode on — <b>help</b> has a new section.", "dim");
      say("(nothing here is real: there is no account, no server and no", "dim");
      say(" password. it is a prompt string and a few extra commands.)", "dim");
      enterDev();
    } else {
      say("you already have it. there is nothing behind it.", "dim");
    }
  };

  CMD.crt = function(args){
    var a = (args[0] || "").toLowerCase();
    var on = a === "off" ? false : a === "on" ? true : !crtOn;
    setCrt(on);
    say("CRT mode " + (on ? "on — scanlines, vignette, an honest amount of flicker."
                          : "off."), "dim");
  };

  CMD.attic = function(){
    open("attic");
    say("opening \\NSR\\ATTIC …", "dim");
  };

  CMD.eggs = function(){ CMD.nsrsh(["--hidden"]); };

  CMD.nsrsh = function(args){
    if((args[0] || "") !== "--hidden"){
      say("nsrsh 1.0 — the shell this desktop runs.", "dim");
      say("try <b>help</b>. or read the page source; it is not minified.", "dim");
      return;
    }
    found("hidden");
    sayOverride = eggCount() + " of " + EGGS.length + " hidden things found.";
    say("hidden layer", "head");
    say("");
    EGGS.forEach(function(e){
      var got = !!eggsFound[e[0]];
      say('<span class="k">' + (got ? "◆ " : "◇ ") +
          (got ? e[1] : "——————").padEnd(11) +
          '</span><span class="v">' + e[2] + "</span>");
    });
    say("");
    say(eggCount() + " / " + EGGS.length + " found. Nothing is scored, nothing is sent " +
        "anywhere, and none of it is on a menu.", "dim");
  };

  CMD.debug = function(){
    sayOverride = "System report printed.";
    say("system report", "head");
    say(sysReport().replace(/\n/g, "<br>"), "", false);
  };

  ALIASES.egg = "eggs";
  ALIASES.root = "sudo";

  var helpBefore = CMD.help;
  CMD.help = function(){
    helpBefore();
    if(!devMode) return;
    say("");
    say("developer", "head");
    rows([
      ["crt",     "scanlines, vignette and flicker — <b>crt off</b> to stop"],
      ["attic",   "the room with no icon"],
      ["eggs",    "what is hidden, and what you have found"],
      ["debug",   "what this page is actually doing right now"]
    ]);
  };

  /* ---------- a hint for whoever opens devtools ---------- */
  try{
    console.log("%cNSR-OS 1.0", "font:600 22px monospace;color:#E85A9B");
    console.log("%cHand-written. One file, no framework, no backend, no analytics.",
                "color:#6FD6E8;font:13px monospace");
    console.log("%cThere is a hidden layer in here. The shell has an undocumented flag:" +
                "  nsrsh --hidden", "color:#F5A657;font:13px monospace");
  }catch(e){}
