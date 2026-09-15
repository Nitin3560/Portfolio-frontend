  /* ---------- SIGNAL.EXE — the deepest room in the hidden layer ----------
     A 90s handheld creature-collector, built out of parts this desktop already
     has: a real .win window (so drag, resize, maximise, minimise, Escape, the
     taskbar and the mobile fold control all work without new code), the same
     bevel and type tokens as everything else, and the same inline-SVG pixel
     technique as the desktop icons. Nothing is fetched and nothing is drawn
     until the first encounter: each creature is a 16x16 string grid turned
     into <rect> runs on first sight, then cached.

     The creatures are original — no borrowed names, no borrowed artwork. Each
     one stands for a real part of the work described elsewhere on this
     desktop; none of them claim anything that is not already on the r'sum'. */

  var SIG_KEY = "nsros_signals";

  /* "." is transparent; "1".."6" index the creature's own six-colour ramp. */
  var SIGNALS = [
    {
      no:1, id:"pixl", name:"PIXL", kana:"ピクル", type:"WEB", move:"REPAINT", lv:12,
      skills:["JavaScript","HTML/CSS","Vue 3","React"],
      blurb:"Lives inside a cursor. Redraws whatever you point it at, then asks why it was drawn that way in the first place.",
      pal:["#2B1B4E","#EFEAF9","#B9B2CC","#6FD6E8","#221A46","#E85A9B"],
      rows:[
        "................","....11..........","....121.........","....1221........",
        "....12221.......","....122221......","....1225221.....","....12255221....",
        "....122552221...","....1222222221..","....1222211111..","....1223321.....",
        "....1221.1221...","....121...1221..","....11.....121..","............11.."
      ]
    },
    {
      no:2, id:"kumomi", name:"KUMOMI", kana:"クモミ", type:"CLOUD", move:"FAN-OUT", lv:24,
      skills:["AWS Lambda","S3","SQS","SES"],
      blurb:"A cloud that only exists while something is happening. Bills you for the milliseconds, then evaporates.",
      pal:["#2B1B4E","#F1EFF6","#C3BCD6","#F5A657","#221A46","#6FD6E8"],
      rows:[
        "................","................","......1111......",".....133331.....",
        "...11333333311..","..1333333333331.","..1333533353331.","..1333333333331.",
        "..1322222222231.","..1222222222221.","...11111111111..","....1331..1331..",
        "....1331..1331..",".....11....11...","................","................"
      ]
    },
    {
      no:3, id:"helmi", name:"HELMI", kana:"ヘルミ", type:"ORCHESTRA", move:"ROLLING UPDATE", lv:31,
      skills:["Kubernetes","Docker","Helm","GKE"],
      blurb:"Steers a fleet it cannot see. Replaces its own parts while running and denies there was ever any downtime.",
      pal:["#2B1B4E","#6FD6E8","#3E8FA8","#EFEAF9","#221A46","#F5A657"],
      rows:[
        "................",".......66.......",".....111111.....","...1122222211...",
        "..112333333211..","..123444444321..","6612345445432166","6612344444432166",
        "..123444444321..","..112333333211..","...1122222211...",".....111111.....",
        ".......66.......","................","................","................"
      ]
    },
    {
      no:4, id:"tensa", name:"TENSA", kana:"テンサ", type:"NEURAL", move:"BACKPROP", lv:28,
      skills:["PyTorch","TensorFlow","Keras","MLflow"],
      blurb:"Wrong on purpose, thousands of times, until it is less wrong. Files every mistake under research.",
      pal:["#2B1B4E","#E85A9B","#F58FBB","#FFF0B8","#221A46","#6FD6E8"],
      rows:[
        "................","..1..........1..","..21........12..","..121......121..",
        "...1211111121...","....12222221....","...1233333321...","...1235335321...",
        "...1233333321...","....12222221....","...1211111121...","..121......121..",
        "..21........12..","..1..........1..","................","................"
      ]
    },
    {
      no:5, id:"kuda", name:"KUDA", kana:"クーダ", type:"SILICON", move:"KERNEL LAUNCH", lv:35,
      skills:["CUDA","cuDNN","TorchScript","GPU profiling"],
      blurb:"Refuses to do one thing at a time. Runs ten thousand tiny errands at once and still blames the memory bandwidth.",
      pal:["#0B0718","#3E2C6B","#6FD6E8","#F5A657","#0B0718","#E85A9B"],
      rows:[
        "................","................","...11..11..11...","..111111111111..",
        "..122222222221..","4412233333322144","4412235335322144","4412233333322144",
        "..122222222221..","..111111111111..","...11..11..11...","................",
        "................","................","................","................"
      ]
    },
    {
      no:6, id:"ragu", name:"RAGU", kana:"ラグ", type:"RETRIEVAL", move:"RECALL", lv:22,
      skills:["LangGraph","LanceDB","Django","Agentic RAG"],
      blurb:"Remembers the thing you said ten turns ago and produces it at the exact moment it becomes relevant. Slightly smug about it.",
      pal:["#2B1B4E","#F5A657","#C77A2E","#FFF0B8","#221A46","#6FD6E8"],
      rows:[
        "................","................","...1111111111...","...1222222221...",
        "...1244444421...","...1245445421...","...1244444421...","...1222222221...",
        "...1333333331...","...1366666631...","...1333333331...","...1222222221...",
        "...1111111111...","....11....11....","................","................"
      ]
    },
    {
      no:7, id:"redix", name:"REDIX", kana:"レディクス", type:"STORE", move:"CACHE HIT", lv:26,
      skills:["PostgreSQL","MySQL","Redis","DynamoDB"],
      blurb:"Keeps everything you have ever handed it, and returns the popular parts before you have finished asking.",
      pal:["#2B1B4E","#6B3FA0","#9A76C9","#6FD6E8","#221A46","#E85A9B"],
      rows:[
        "................","................","....11111111....","...1222222221...",
        "...1235335321...","...1222222221...","...1111111111...","...1222222221...",
        "...1244444421...","...1222222221...","...1111111111...","...1222222221...",
        "...1266666621...","...1222222221...","....11111111....","................"
      ]
    },
    {
      no:8, id:"token", name:"TOKEN", kana:"トークン", type:"STREAM", move:"ONE AT A TIME", lv:19,
      skills:["FastAPI","SSE streaming","JWT","REST"],
      blurb:"Will not wait for the whole answer. Arrives a piece at a time so the room never goes quiet.",
      pal:["#2B1B4E","#FFF0B8","#F5A657","#E85A9B","#221A46","#6FD6E8"],
      rows:[
        "................","................",".....111111.....","....11222211....",
        "...1122222211...","...1245555421...","...1245445421...","...1222222221...",
        "....11222211....",".....111111.....","......1221......","...6..1221..6...",
        "..66..1221..66..","...6...11...6...","................","................"
      ]
    },
    {
      no:9, id:"reko", name:"REKO", kana:"レコ", type:"VISION", move:"AUTO-LABEL", lv:21,
      skills:["Rekognition","OpenSearch","Amazon Lex","S3 events"],
      blurb:"Looks at a photograph the second it lands and writes down what is in it, so you can find it again in words.",
      pal:["#2B1B4E","#413A52","#6FD6E8","#EFEAF9","#221A46","#F5A657"],
      rows:[
        "................","................","....11....11....","...1661..1661...",
        "..111111111111..","..122222222221..","..123333333321..","..123345553321..",
        "..123355553321..","..123333333321..","..122222222221..","..111111111111..",
        "...11......11...","................","................","................"
      ]
    },
    {
      no:10, id:"gitsu", name:"GITSU", kana:"ギツ", type:"PHANTOM", move:"FORCE PUSH", lv:33,
      skills:["Git","GitHub Actions","CI/CD","Helm rollouts"],
      blurb:"Every version of everything you thought you had deleted. Turns up on the branch you were sure was clean.",
      pal:["#2B1B4E","#EFEAF9","#B9B2CC","#E85A9B","#221A46","#6FD6E8"],
      rows:[
        "................","................",".....111111.....","....11222211....",
        "...1122222211...","...1225225221...","...1225225221...","...1222222221...",
        "...1222442221...","...1222222221...","...1222222221...","...1221221221...",
        "...1.11..11.1...","................","................","................"
      ]
    }
  ];

  var SIG_BY_ID = {};
  SIGNALS.forEach(function(m){ SIG_BY_ID[m.id] = m; });

  /* ---------- state ---------- */
  var sigCaught = {};
  (function loadSig(){
    try{
      (window.localStorage.getItem(SIG_KEY) || "").split(",").forEach(function(id){
        if(SIG_BY_ID[id]) sigCaught[id] = true;
      });
    }catch(e){}
  })();
  function sigSave(){
    try{ window.localStorage.setItem(SIG_KEY, Object.keys(sigCaught).join(",")); }catch(e){}
  }
  function sigCount(){ return Object.keys(sigCaught).length; }

  /* ---------- sprites ----------
     Built the first time a creature is seen and cached on the record, so an
     untouched desktop never assembles a single <rect>. Horizontal runs are
     merged: a 16x16 grid becomes ~40 rects instead of 256. */
  function sigSvg(mon){
    if(mon._svg) return mon._svg;
    var out = "", y, x, r, c, n;
    for(y = 0; y < 16; y++){
      r = mon.rows[y]; x = 0;
      while(x < 16){
        c = r.charAt(x);
        if(c === "."){ x++; continue; }
        n = 1;
        while(x + n < 16 && r.charAt(x + n) === c) n++;
        out += '<rect x="' + x + '" y="' + y + '" width="' + n + '" height="1" fill="' +
               mon.pal[+c - 1] + '"/>';
        x += n;
      }
    }
    mon._svg = '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' +
               out + '</svg>';
    return mon._svg;
  }
  /* an unfound creature is its own silhouette: one flat colour, same shape */
  function sigShadow(mon){
    if(mon._shadow) return mon._shadow;
    mon._shadow = sigSvg(mon).replace(/fill="#[0-9A-Fa-f]{6}"/g, 'fill="#241C46"');
    return mon._shadow;
  }

  /* ---------- sound: borrows the page's context, never makes one ---------- */
  var sigGain = null;
  function sigBlip(freq, dur, type){
    if(!ac || ac.state !== "running" || muted) return;
    try{
      if(!sigGain){
        sigGain = ac.createGain(); sigGain.gain.value = 0.05;
        sigGain.connect(ac.destination);
      }
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.9, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      o.connect(g); g.connect(sigGain);
      o.start(); o.stop(ac.currentTime + dur + 0.02);
    }catch(e){}                       /* sound must never break the encounter */
  }

  /* ---------- the window ---------- */
  var sigWin    = wins.dex;
  var sigScreen = document.getElementById("sigScreen");
  var sigEncEl  = document.getElementById("sigEnc");
  var sigEntEl  = document.getElementById("sigEntry");
  var sigIdxEl  = document.getElementById("sigIndex");
  var sigKeysEl = document.getElementById("sigKeys");
  var sigHintEl = document.getElementById("sigHint");
  var sigCntEl  = document.getElementById("sigCount");

  var sigView = "index", sigWild = null, sigBusy = false;

  function sigKey(label, fn, primary){
    var b = document.createElement("button");
    b.type = "button";
    b.className = "pac-btn" + (primary ? " sig-key-go" : "");
    b.textContent = label;
    b.addEventListener("click", fn);
    return b;
  }
  function sigSetKeys(defs){
    sigKeysEl.innerHTML = "";
    defs.forEach(function(d){ sigKeysEl.appendChild(sigKey(d[0], d[1], d[2])); });
  }
  function sigShow(v){
    sigView = v;
    sigEncEl.hidden = v !== "enc";
    sigEntEl.hidden = v !== "entry";
    sigIdxEl.hidden = v !== "index";
    sigCntEl.textContent = sigCount() + " / " + SIGNALS.length;
  }
  function sigFocusFirstKey(){
    var b = sigKeysEl.querySelector("button");
    if(b) b.focus({preventScroll:true});
  }

  /* ----- encounter ----- */
  function sigPick(){
    var left = SIGNALS.filter(function(m){ return !sigCaught[m.id]; });
    var from = left.length ? left : SIGNALS;
    return from[(Math.random() * from.length) | 0];
  }
  function sigEncounter(){
    if(sigBusy) return;
    sigWild = sigPick();
    sigBusy = true;
    if(!reduced){
      document.documentElement.classList.add("sig-flash");
      setTimeout(function(){ document.documentElement.classList.remove("sig-flash"); }, 260);
    }
    sigEncEl.innerHTML =
      '<p class="sig-line">A wild signal appeared.</p>' +
      '<div class="sig-field"><div class="sig-art sig-in">' + sigSvg(sigWild) + '</div>' +
      '<i class="sig-cap" id="sigCap" aria-hidden="true"></i></div>' +
      '<p class="sig-name">' + sigWild.name + '<span>' + sigWild.kana + '</span></p>' +
      '<p class="sig-meta">Lv. ' + sigWild.lv + ' &middot; ' + sigWild.type + '</p>' +
      '<div class="sig-bar" id="sigHp" role="img" aria-label="Signal strength full">' +
        '<i style="width:100%"></i></div>';
    sigHintEl.textContent = sigCaught[sigWild.id]
      ? "You have logged this one already. It does not seem to remember."
      : "Catch it to add it to the index. Nothing is scored and nothing is sent anywhere.";
    sigSetKeys([["CATCH", sigCatch, true], ["RUN", sigRun]]);
    sigShow("enc");
    open("dex");
    sigBlip(660, 0.07); setTimeout(function(){ sigBlip(880, 0.09); }, 90);
    setTimeout(sigFocusFirstKey, 30);
  }

  function sigCatch(){
    var mon = sigWild;
    if(!mon) return;
    sigSetKeys([]);
    var hp = document.querySelector("#sigHp i");
    var cap = document.getElementById("sigCap");
    var art = sigEncEl.querySelector(".sig-art");
    var wait = reduced ? 0 : 760;
    if(!reduced){
      if(cap) cap.classList.add("go");
      if(art) art.classList.add("caught");
      if(hp) hp.style.width = "18%";
      sigBlip(520, 0.06);
      setTimeout(function(){ sigBlip(400, 0.06); }, 240);
      setTimeout(function(){ sigBlip(300, 0.06); }, 480);
    }
    setTimeout(function(){
      sigBlip(784, 0.09); setTimeout(function(){ sigBlip(1046, 0.16); }, 110);
      var isNew = !sigCaught[mon.id];
      sigCaught[mon.id] = true;
      sigSave();
      sigBusy = false;
      sigEntry(mon, isNew);
      if(isNew && typeof found === "function") found("signal");
    }, wait);
  }

  function sigRun(){
    sigBusy = false;
    sigWild = null;
    sigBlip(300, 0.08, "triangle");
    sigEncEl.innerHTML = '<p class="sig-line">Maybe next time.</p>' +
      '<div class="sig-field sig-empty"><span>—</span></div>' +
      '<p class="sig-meta">The neon goes back to being neon.</p>';
    sigHintEl.textContent = "Another one is out there. The signs on the skyline are not decoration.";
    sigSetKeys([["INDEX", function(){ sigIndex(); }, true], ["CLOSE", function(){ close("dex"); }]]);
    setTimeout(sigFocusFirstKey, 30);
  }

  /* ----- one creature's page ----- */
  function sigEntry(mon, isNew){
    var pct = Math.min(96, 40 + mon.lv * 1.6);
    sigEntEl.innerHTML =
      (isNew ? '<p class="sig-line sig-got">Gotcha. ' + mon.name + ' was logged.</p>' : '') +
      '<p class="sig-kicker">INDEX ENTRY</p>' +
      '<div class="sig-row">' +
        '<div class="sig-art sm">' + sigSvg(mon) + '</div>' +
        '<div class="sig-id">' +
          '<p class="sig-no">No.' + String(mon.no).padStart(3, "0") + '</p>' +
          '<p class="sig-name">' + mon.name + '<span>' + mon.kana + '</span></p>' +
          '<p class="sig-meta">' + mon.type + ' &middot; Lv. ' + mon.lv + '</p>' +
        '</div>' +
      '</div>' +
      '<dl class="sig-dl">' +
        '<dt>SKILLSET</dt><dd>' + mon.skills.join(" &middot; ") + '</dd>' +
        '<dt>SPECIAL MOVE</dt><dd class="sig-move">' + mon.move + '</dd>' +
      '</dl>' +
      '<p class="sig-blurb">' + mon.blurb + '</p>' +
      '<p class="sig-meta">EXP</p>' +
      '<div class="sig-bar" role="img" aria-label="Experience ' + Math.round(pct) + ' percent">' +
        '<i style="width:' + pct + '%"></i></div>';
    sigHintEl.textContent = "Everything listed here is on this desktop somewhere else, in less costume.";
    sigSetKeys([["INDEX", function(){ sigIndex(); }, true], ["CLOSE", function(){ close("dex"); }]]);
    sigShow("entry");
    open("dex");
    setTimeout(sigFocusFirstKey, 30);
  }

  /* ----- the index ----- */
  function sigIndex(){
    var html = '<p class="sig-kicker">SIGNAL INDEX</p><ul class="sig-list">';
    SIGNALS.forEach(function(m){
      var got = !!sigCaught[m.id];
      html += '<li class="sig-cell' + (got ? "" : " locked") + '">' +
        (got ? '<button type="button" class="sig-pick" data-mon="' + m.id + '">' : '<span>') +
        '<span class="sig-art xs">' + (got ? sigSvg(m) : sigShadow(m)) + '</span>' +
        '<b>' + String(m.no).padStart(3, "0") + '</b>' +
        '<span class="sig-cn">' + (got ? m.name : "??????") + '</span>' +
        (got ? '</button>' : '</span>') + '</li>';
    });
    html += '</ul>';
    sigIdxEl.innerHTML = html;
    Array.prototype.forEach.call(sigIdxEl.querySelectorAll(".sig-pick"), function(b){
      b.addEventListener("click", function(){
        sigEntry(SIG_BY_ID[b.dataset.mon], false);
      });
    });
    sigHintEl.textContent = sigCount() === SIGNALS.length
      ? "All ten. There is nothing else in the neon."
      : "Found " + sigCount() + " of " + SIGNALS.length + ". The rest are still out on the skyline.";
    sigSetKeys([["CLOSE", function(){ close("dex"); }, true]]);
    sigShow("index");
    open("dex");
    setTimeout(sigFocusFirstKey, 30);
  }

  /* ---------- the trigger: the neon signs on the wallpaper ----------
     signs[] is the list of rectangles 60-wallpaper.js painted onto the
     skyline, in CSS pixels. They are the only clickable thing on the desktop
     background, they are small, and they are lit — which is as close to
     "there is something here" as this desktop gets without saying so. */
  var sigWall = document.getElementById("wall");
  var sigSlack = window.matchMedia("(pointer:coarse)").matches ? 12 : 6;
  function sigHit(e){
    var r = sigWall.getBoundingClientRect();
    var x = e.clientX - r.left, y = e.clientY - r.top;
    for(var i = 0; i < signs.length; i++){
      var s = signs[i];
      /* slack around the rectangle, more of it where the pointer is a finger */
      var g = sigSlack;
      if(x >= s.x - g && x <= s.x + s.w + g && y >= s.y - g && y <= s.y + s.h + g) return s;
    }
    return null;
  }
  function sigTap(e){
    if(!signs.length || !sigHit(e)) return;
    sigEncounter();
  }
  sigWall.addEventListener("click", sigTap);
  /* In the mobile stack the wallpaper is covered by the masthead — which is
     transparent, so the city (and the signs) are right there behind the name.
     Tapping one still means tapping a neon sign; it just has to pass through
     the header to reach it. The header holds no controls, so nothing else on
     it is competing for the tap. */
  var sigHead = document.getElementById("stackhead");
  if(sigHead) sigHead.addEventListener("click", sigTap);
  /* the cursor is the only hint on the desktop itself */
  sigWall.addEventListener("pointermove", function(e){
    if(e.pointerType !== "mouse") return;
    sigWall.style.cursor = sigHit(e) ? "pointer" : "";
  }, {passive:true});

  /* ---------- Escape: back one screen, then out ----------
     No other window on this desktop closes on Escape, so this is scoped to
     this one and only while it is the window in front. */
  document.addEventListener("keydown", function(e){
    if(e.key !== "Escape") return;
    if(!sigWin.classList.contains("open") || isFlow()) return;
    if(!sigWin.classList.contains("focused")) return;
    if(sigView === "index"){ close("dex"); }
    else { sigIndex(); }
  }, false);

  /* ---------- ways back in ---------- */
  CMD.dex = function(){
    sigIndex();
    say("SIGNAL.EXE — " + sigCount() + " of " + SIGNALS.length + " logged.", "dim");
  };
  ALIASES.signal = "dex";

  var sigHelpBefore = CMD.help;
  CMD.help = function(){
    sigHelpBefore();
    if(!devMode) return;
    rows([["dex", "the index of whatever is living in the neon"]]);
  };
