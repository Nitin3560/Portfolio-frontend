  /* ---------- terminal ---------- */
  var tOut = document.getElementById("tOut");
  var tIn  = document.getElementById("tIn");
  var tHist = [], tHistAt = -1, loadedAt = Date.now();
  var PS1 = "hao@hy-os:~$";      /* one string; 97-eggs.js rewrites it */

  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];
    });
  }
  /* every caller passes markup it built itself; anything typed by the
     visitor goes through esc() before it gets here. */
  var tSay = document.getElementById("tSay");
  var sayBuf = [];
  var sayOverride = null;   /* a command may set a one-line summary instead */
  /* `announce`: omit to speak the line's own text, pass a string to speak
     something else, pass false for decorative output (ASCII art). */
  function say(html, cls, announce){
    var d = document.createElement("div");
    d.className = "tl" + (cls ? " " + cls : "");
    d.innerHTML = html === "" ? "&nbsp;" : html;
    tOut.appendChild(d);
    tOut.scrollTop = tOut.scrollHeight;
    if(announce !== false){
      var t = typeof announce === "string" ? announce : d.textContent.trim();
      if(t) sayBuf.push(t);
    }
    return d;
  }
  function rows(pairs){
    pairs.forEach(function(p){
      say('<span class="k">' + p[0].padEnd(11) + '</span><span class="v">' + p[1] + '</span>');
    });
  }

  var FILES = {
    "readme.txt": [
      "Nitin Singh Rathore — Arlington, Texas",
      "",
      "Backend engineering, distributed systems, and practical AI.",
      "",
      "I’m pursuing an M.S. in Computer Science at the University of Texas at Arlington, with graduation expected in December 2026. My work spans backend engineering, distributed systems, and applied AI. At WERBOOZ, I built and maintained production services, optimized database queries, and integrated APIs across enterprise applications.",
      "",
      "My projects turn that experience into practical tools: YoMeets combines real-time AI meeting assistance with workflow automation, CareerOS focuses on search and ranking, and CloudQueue processes web-scraping jobs through distributed workers. I also work as a Graduate Teaching Assistant at UT Arlington and research reliable coordination for autonomous UAV networks.",
      "",
      "Open to software engineering internships and full-time opportunities."
],
    "skills.txt": [
      "languages   C/C++, Python, Java, Go, SQL, JavaScript, HTML/CSS, C#, ARM asm, YAML",
      "web/devops  AWS, GCP, Docker, Kubernetes, REST, Redis, Git, PostgreSQL, MySQL, JWT",
      "frameworks  FastAPI, Flask, Django, Spring Boot, React, Vue 3, Unity3D",
      "ml          PyTorch, TensorFlow, Keras, NumPy, Pandas, MLflow",
      "dl systems  CUDA, cuDNN, TorchScript, GPU profiling, inference optimization"
    ],
    "education.txt": [
      "University of Texas at Arlington     Jan 2025 – Dec 2026 (expected)",
      "  M.S. Computer Science · Arlington, Texas",
      "  Artificial Intelligence, Machine Learning, Cloud Computing,",
      "  Neural Networks, Software Testing, BATs",
      "",
      "Acropolis Institute of Technology & Research       2019 – 2023",
      "  B.Tech. Computer Science · India",
      "  Data Structures & Algorithms, Object-Oriented Programming,",
      "  Operating Systems, Database Management Systems, Computer Networks,",
      "  Software Engineering, Discrete Mathematics, Computer Organization & Architecture"
    ],
    "experience.txt": [
      "University of Texas at Arlington | Graduate Teaching Assistant · Arlington, TX     Jan 2025 – present",
      "  · Support CS coursework through labs, mentoring, grading, and technical explanations.",
      "  · Help students with programming, debugging, data structures, and systems fundamentals.",
      "  · Continue research work on reliable coordination for autonomous UAV networks.",
      "",
      "WERBOOZ Pvt. Ltd | Software Engineer · Indore, India     Sep 2023 – Oct 2024",
      "  · Architected and maintained 6 Java/Apex backend services across 3 enterprise clients.",
      "  · Reduced manual processing overhead by 40% with modular service boundaries.",
      "  · Built REST/SOAP integrations across 5+ systems with 99.8% production uptime.",
      "  · Optimized 15+ SOQL/SQL queries, cutting high-latency query times by 35%.",
      "  · Authored 500+ JUnit/Postman/Tosca test cases and reduced QA cycle time by 2 days per sprint.",
      "  · Resolved 12 critical incidents through logs and root-cause debugging within 2-hour SLAs.",
      "",
      "WERBOOZ Pvt. Ltd | Software Developer Intern · Indore, India     Feb 2023 – Sep 2023",
      "  · Improved module-level processing efficiency by 15% across 4 Java/SQL data-access modules.",
      "  · Reduced average query execution time from about 320ms to 275ms.",
      "  · Wrote JUnit unit/integration tests that eliminated 20+ pre-production bugs across 3 release cycles.",
      "  · Shipped 4 backend features through Git PR workflows for 2 major quarterly releases."
    ],
    "contact.txt": [
      "email     nxr3560@mavs.uta.edu",
      "github    github.com/Nitin3560",
      "linkedin  linkedin.com/in/nitin-singh-rathore",
      "based in  Brooklyn, New York"
    ]
  };

  var PROJECTS = [
    ["CareerOS", "FastAPI · Next.js · PostgreSQL · Redis/RQ · Docker", "Nitin3560/careeros",
     "Search and ranking platform indexing 31,200+ docs with median lookup cut from 690ms to 3.5ms."],
    ["YoMeets", "TypeScript · Node.js · PostgreSQL/pgvector · Deepgram", "Nitin3560/YoMeets",
     "Real-time AI meeting assistant with RAG precision near 94% and p95 latency under 3s."],
    ["CloudQueue", "Python · Redis · AWS · Docker · Kubernetes · Terraform", "",
     "Distributed scraping queue processing about 1.4k tasks/sec with duplicate-safe recovery."],
    ["TwinGuard", "ROS 2 · PX4 SITL · Gazebo · C++17 · BehaviorTree.CPP · Nav2", "Nitin3560/TwinGuard",
     "Trust-aware UAV autonomy framework with localization integrity estimation and offboard supervision."]
  ];

  var WINKEYS = {
    readme:"about", about:"about", projects:"projects", experience:"experience",
    exp:"experience", skills:"skills", education:"education", edu:"education",
    contact:"contact", resume:"resume", player:"player", music:"player",
    terminal:"terminal", term:"terminal", pacman:"pacman", pac:"pacman", game:"pacman"
  };

  function uptime(){
    var s = Math.floor((Date.now() - loadedAt) / 1000);
    var h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60);
    return (h ? h + "h " : "") + m + "m " + (s % 60) + "s";
  }

  var CMD = {};

  CMD.help = function(){
    sayOverride = "13 commands listed. Read them in the terminal output.";
    say("available commands", "head");
    rows([
      ["help",      "this list"],
      ["whoami",    "who runs this machine"],
      ["ls",        "list the files on this desktop"],
      ["cat",       "print a file — try <b>cat readme.txt</b>"],
      ["projects",  "the three things I built, with repo links"],
      ["open",      "open a window — <b>open projects</b>, <b>open player</b>"],
      ["play",      "start the music · also <b>pause</b>, <b>next</b>, <b>mute</b>"],
      ["chiptune",  "play live FM synthesis instead of files · <b>chiptune on</b>"],
      ["email",     "open a message to me"],
      ["github",    "open my GitHub · also <b>linkedin</b>"],
      ["resume",    "open the résumé"],
      ["neofetch",  "system info, the way you'd expect"],
      ["date",      "current time · also <b>uptime</b>, <b>pwd</b>, <b>uname</b>"],
      ["clear",     "wipe the screen"]
    ]);
  };

  CMD.whoami = function(){
    say("hao — software engineer, Brooklyn NY.");
    say("M.S. Computer Engineering @ NYU, May 2026. Backend, AWS, applied AI.");
    say('Seeking intern and full-time SWE roles starting May 2026.', "dim");
  };

  CMD.ls = function(){
    var names = Object.keys(FILES).concat(["projects/", "resume.pdf"]);
    say(names.map(function(n){ return esc(n); }).join("   "));
  };

  CMD.cat = function(args){
    var name = (args[0] || "").toLowerCase();
    if(!name){ say("cat: give me a filename. try <b>ls</b>", "err"); return; }
    if(name === "projects" || name === "projects/"){ CMD.projects(); return; }
    var f = FILES[name] || FILES[name + ".txt"];
    if(!f){ say("cat: " + esc(name) + ": no such file", "err"); return; }
    sayOverride = name + ": " + f.filter(Boolean).length + " lines. Read them in the terminal output.";
    f.forEach(function(l){ say(esc(l)); });
  };

  CMD.projects = function(){
    sayOverride = "3 projects listed: " + PROJECTS.map(function(x){ return x[0]; }).join(", ");
    PROJECTS.forEach(function(p, i){
      say((i ? "" : "") + "<b>" + esc(p[0]) + "</b>");
      say('<span class="dim">' + esc(p[1]) + "</span>");
      say(esc(p[3]));
      if(p[2]) say('  → <a href="https://github.com/' + p[2] +
          '" target="_blank" rel="noopener noreferrer">github.com/' + p[2] + "</a>");
      else say("  → Repository available on request", "dim");
      if(i < PROJECTS.length - 1) say("");
    });
  };

  CMD.open = function(args){
    var k = WINKEYS[(args[0] || "").toLowerCase()];
    if(!k){
      say("open: which window? " + Object.keys(WINKEYS).slice(0, 8).join(", ") + "…", "err");
      return;
    }
    open(k);
    say("opening " + esc(LABEL[k]) + " …", "dim");
  };

  CMD.play  = function(){ play();  say("▶ " + esc(LIST[plIdx].name || LIST[plIdx].title), "dim"); };
  CMD.pause = function(){ pause(); say("paused", "dim"); };
  CMD.next  = function(){ skip(1); say("▶ " + esc(LIST[plIdx].name || LIST[plIdx].title), "dim"); };
  CMD.mute  = function(){ setMuted(!muted); say(muted ? "muted" : "unmuted", "dim"); };
  CMD.chiptune = function(args){
    var a = (args[0] || "").toLowerCase();
    var on = a === "on" ? true : a === "off" ? false : fileMode;
    setChiptune(on);
    say(fileMode ? "source: audio files" : "source: FM synthesis, generated live", "dim");
    if(!fileMode) say("\u266a " + esc(LIST[plIdx].name || LIST[plIdx].title), "dim");
  };

  CMD.email = function(){ openCompose(); say("opening a new message …", "dim"); };
  CMD.github = function(){
    window.open("https://github.com/Nitin3560", "_blank", "noopener");
    say("github.com/Nitin3560", "dim");
  };
  CMD.linkedin = function(){
    window.open("https://www.linkedin.com/in/nitin-singh-rathore/", "_blank", "noopener");
    say("linkedin.com/in/nitin-singh-rathore", "dim");
  };
  CMD.resume = function(){ open("resume"); say("opening the résumé …", "dim"); };

  CMD.neofetch = function(){
    var art = [
      "██  ██  ██   ██",
      "██  ██   ██ ██ ",
      "██████    ███  ",
      "██  ██     █   ",
      "██  ██     █   "
    ];
    var info = [
      ["", "<b>hao@hy-os</b>"],
      ["", '<span class="dim">─────────</span>'],
      ["OS",      "HY-OS 1.0 (runs in your browser)"],
      ["Host",    "Brooklyn, New York"],
      ["Kernel",  "vanilla JS — no framework, one file"],
      ["Shell",   "hysh 1.0"],
      ["Uptime",  uptime()],
      ["Audio",   "Web Audio" + (fileMode ? " + audio files" : " synthesis, no files")],
      ["Degrees", "M.S. CE @ NYU · 2× B.S. @ UW"],
      ["Contact", "nxr3560@mavs.uta.edu"]
    ];
    var n = Math.max(art.length, info.length);
    for(var i = 0; i < n; i++){
      var left = (art[i] || "").padEnd(17);
      var r = info[i];
      var right = r ? (r[0] ? '<span class="k">' + r[0].padEnd(9) + "</span>" + r[1] : r[1]) : "";
      say('<span class="head" aria-hidden="true">' + left + "</span>" + right, null, false);
    }
    /* announce the facts, not the block letters */
    sayOverride = "System info: " + info.filter(function(r){ return r[0]; })
      .slice(0, 4).map(function(r){ return r[0] + " " + r[1].replace(/<[^>]*>/g, ""); })
      .join(", ") + ". More in the terminal output.";
  };

  CMD.date   = function(){ say(esc(new Date().toString())); };
  CMD.uptime = function(){ say("up " + uptime()); };
  CMD.pwd    = function(){ say("/home/hao"); };
  CMD.uname  = function(){ say("HY-OS 1.0 web javascript"); };
  CMD.echo   = function(args){ say(esc(args.join(" "))); };
  CMD.clear  = function(){ tOut.innerHTML = ""; };
  CMD.history = function(){
    tHist.forEach(function(h, i){
      say('<span class="k">' + String(i + 1).padStart(4) + "  </span>" + esc(h));
    });
  };
  CMD.sudo = function(){ say("nice try. this account has no sudoers entry.", "dim"); };
  CMD.exit = function(){ say("bye", "dim"); setTimeout(function(){ close("terminal"); }, 260); };

  var ALIASES = { man:"help", "?":"help", dir:"ls", quit:"exit", cls:"clear",
                  about:"whoami", contact:"email", song:"play", stop:"pause" };

  function runLine(raw){
    var line = raw.trim();
    sayBuf = []; sayOverride = null;
    say('<span class="ps1">' + esc(PS1) + '</span> ' + esc(line), "cmd", false);
    if(!line) return;
    tHist.push(line); tHistAt = tHist.length;

    var parts = line.split(/\s+/);
    var name = parts[0].toLowerCase();
    name = ALIASES[name] || name;
    var fn = CMD[name];
    if(fn) fn(parts.slice(1));
    else say(esc(parts[0]) + ": command not found — type <b>help</b>", "err");

    /* Screen readers read a polite announcement as one uninterruptible run, so a
       long one is worse than none. Detail stays browsable in the role="log". */
    var msg;
    if(sayOverride){
      msg = sayOverride;
    } else {
      msg = sayBuf.map(function(t){ return t.replace(/[.\s]+$/, ""); })
                  .join(". ").replace(/\s+/g, " ");
      if(msg.length > 220) msg = name + ": " + sayBuf.length + " lines of output";
    }
    tSay.textContent = msg || "done";
    sayOverride = null;
    sayBuf = [];
  }

  tIn.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      var v = tIn.value; tIn.value = "";
      runLine(v);
    } else if(e.key === "ArrowUp"){
      e.preventDefault();
      if(tHistAt > 0){ tHistAt--; tIn.value = tHist[tHistAt]; }
    } else if(e.key === "ArrowDown"){
      e.preventDefault();
      if(tHistAt < tHist.length - 1){ tHistAt++; tIn.value = tHist[tHistAt]; }
      else { tHistAt = tHist.length; tIn.value = ""; }
    } else if(e.key === "Tab"){
      e.preventDefault();
      var p = tIn.value.toLowerCase();
      var hits = Object.keys(CMD).filter(function(c){ return c.indexOf(p) === 0; });
      if(hits.length === 1) tIn.value = hits[0] + " ";
      else if(hits.length > 1) say(hits.join("   "), "dim");
    } else if(e.key === "l" && e.ctrlKey){
      e.preventDefault(); CMD.clear();
    }
  });

  wins.terminal.addEventListener("click", function(e){
    if(e.target.closest("button, a")) return;
    tIn.focus();
  });

  /* focus the prompt whenever the window is opened from an icon or the menu */
  var openWindow = open;
  open = function(k){
    openWindow(k);
    if(k === "terminal") setTimeout(function(){ tIn.focus(); }, 0);
  };

  say('HY-OS 1.0  ·  hysh 1.0', "head");
  say('Type <b>help</b> for a list of commands, or <b>neofetch</b> to show off.', "dim");
  say("");

  /* ---------- focus management ----------
     Opening a window is this site's whole navigation model, so it has to tell
     assistive tech that something happened. The terminal focuses its own prompt,
     so it is excluded. */
  document.getElementById("windows").setAttribute("tabindex", "-1");
  var focusOnOpen = false;      /* off until the desktop has finished booting */
  var openForFocus = open;
  open = function(k){
    var wasOpen = wins[k].classList.contains("open");
    openForFocus(k);
    if(focusOnOpen && !wasOpen && !isFlow() && k !== "terminal"){
      var t = wins[k].querySelector(".titlebar .t");
      t.setAttribute("tabindex", "-1");
      t.focus({preventScroll: true});
    }
  };

  /* ---------- File Download dialog ----------
     The browser's own download UI cannot be styled, so the confirmation step is
     an in-page dialog in the OS's own chassis. It does NOT fake the filesystem:
     the real download is started by a normal <a download> the moment the visitor
     confirms, and the progress pane is a short visual flourish afterwards, not a
     gate in front of it. */
  var RESUME_URL = "Nitin_Resume.pdf";
  var PDF_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><rect x="2" y="1" width="12" height="14" fill="#FBFAFD"/><rect x="2" y="1" width="1" height="14" fill="#413A52"/><rect x="13" y="1" width="1" height="14" fill="#413A52"/><rect x="2" y="1" width="12" height="1" fill="#413A52"/><rect x="2" y="14" width="12" height="1" fill="#413A52"/><rect x="4" y="9" width="8" height="4" fill="#C9316F"/><rect x="4" y="4" width="6" height="1" fill="#514A63"/><rect x="4" y="6" width="7" height="1" fill="#514A63"/></svg>';
  var fdWrap = document.getElementById("fdWrap");
  var fdBody = document.getElementById("fdBody");
  var fdTitle = document.getElementById("fdTitle");
  var fdReturn = null, fdSize = null, fdTimers = [];

  function fdClearTimers(){ fdTimers.forEach(clearTimeout); fdTimers = []; }

  function fdClose(){
    fdClearTimers();
    fdWrap.hidden = true;
    if(fdReturn && fdReturn.isConnected) fdReturn.focus({preventScroll:true});
    fdReturn = null;
  }

  function fmtBytes(n){
    if(!n && n !== 0) return null;
    return n < 1024 ? n + " bytes"
         : n < 1048576 ? Math.round(n / 1024) + " KB"
         : (n / 1048576).toFixed(1) + " MB";
  }

  /* ask the server how big it really is rather than hard-coding a number */
  function fdLookupSize(){
    if(fdSize !== null || !window.fetch || location.protocol === "file:") return;
    fetch(RESUME_URL, {method:"HEAD"}).then(function(r){
      var len = r.headers.get("content-length");
      if(r.ok && len){ fdSize = +len; var el = document.getElementById("fdSize");
        if(el) el.textContent = fmtBytes(fdSize) || "unknown"; }
    }).catch(function(){});
  }

  function fdConfirm(){
    fdTitle.textContent = "File Download";
    fdBody.innerHTML =
      '<div class="fd-row">' + PDF_ICON +
        '<span class="fd-txt">' +
          '<span class="fd-name">Nitin_Resume.pdf</span>' +
          '<p class="fd-q">Do you want to download this file?</p>' +
          '<span class="fd-meta"><b>Type:</b><span>PDF Document</span>' +
            '<b>Size:</b><span id="fdSize">' + (fmtBytes(fdSize) || "\u2014") + '</span></span>' +
        '</span>' +
      '</div>' +
      '<div class="fd-btns">' +
        '<button class="dl" type="button" id="fdGo" data-default>Download</button>' +
        '<button class="dl" type="button" id="fdCancel">Cancel</button>' +
      '</div>';
    document.getElementById("fdGo").addEventListener("click", fdStart);
    document.getElementById("fdCancel").addEventListener("click", fdClose);
    document.getElementById("fdGo").focus({preventScroll:true});
    fdLookupSize();
  }

  function fdStart(){
    /* real download first — the animation must never hold the file up */
    var a = document.createElement("a");
    a.href = RESUME_URL;
    a.download = "Nitin_Resume.pdf";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();

    fdTitle.textContent = "Downloading\u2026";
    fdBody.innerHTML =
      '<div class="fd-row">' + PDF_ICON +
        '<span class="fd-txt"><span class="fd-name">Nitin_Resume.pdf</span>' +
        '<p class="fd-q">Transferring from the web site\u2026</p></span></div>' +
      '<div class="fd-track" id="fdTrack" role="progressbar" aria-label="Download progress" ' +
        'aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"></div>' +
      '<div class="fd-pct" id="fdPct">0%</div>' +
      '<div class="fd-btns"><button class="dl" type="button" id="fdCancel2">Cancel</button></div>';
    document.getElementById("fdCancel2").addEventListener("click", fdClose);
    document.getElementById("fdCancel2").focus({preventScroll:true});

    var track = document.getElementById("fdTrack");
    var pct = document.getElementById("fdPct");
    var blocks = 22, step = 0;
    var tick = function(){
      step++;
      track.innerHTML = new Array(step + 1).join('<i></i>');
      var v = Math.round(step / blocks * 100);
      pct.textContent = v + "%";
      track.setAttribute("aria-valuenow", v);
      if(step < blocks) fdTimers.push(setTimeout(tick, reduced ? 8 : 34));
      else fdTimers.push(setTimeout(fdDone, 220));
    };
    tick();
  }

  function fdDone(){
    fdTitle.textContent = "Download Complete";
    fdBody.innerHTML =
      '<div class="fd-row">' + PDF_ICON +
        '<span class="fd-txt"><span class="fd-name"><span class="fd-ok">\u2713</span> Nitin_Resume.pdf</span>' +
        '<p class="fd-q">Download started. Check your browser\u2019s downloads.</p></span></div>' +
      '<div class="fd-btns"><button class="dl" type="button" id="fdOk" data-default>OK</button></div>';
    var ok = document.getElementById("fdOk");
    ok.addEventListener("click", fdClose);
    ok.focus({preventScroll:true});
  }

  function fdOpen(trigger){
    fdReturn = trigger || null;
    fdWrap.hidden = false;
    fdConfirm();
  }

  document.getElementById("fdX").addEventListener("click", fdClose);
  document.getElementById("fdVeil").addEventListener("click", fdClose);
  fdWrap.addEventListener("keydown", function(e){
    if(e.key === "Escape"){ e.stopPropagation(); fdClose(); return; }
    if(e.key !== "Tab") return;
    var f = fdWrap.querySelectorAll("button");
    if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  /* intercept every résumé control on the page */
  document.addEventListener("click", function(e){
    var t = e.target.closest("[data-resume]");
    if(!t) return;
    e.preventDefault();
    fdOpen(t);
  });

  /* ---------- incoming-message notification ----------
     One unread message for the whole visit: it arrives once, and opening the
     window clears it. Dismissing with X leaves it unread in the tray, the way a
     real messenger would. */
  var qq = document.getElementById("qq");
  var qqBadge = document.getElementById("qqBadge");
  var qqShown = false, qqRead = false, qqTimer = null;

  function showQq(){
    if(qqShown || qqRead) return;
    qqShown = true;
    qq.hidden = false;
    qq.classList.add("in");
    qqBadge.classList.add("live", "unread");
    qqBadge.setAttribute("aria-label", "1 unread message: Recruiter View");
    /* In the stack the toast is fixed over whatever you have scrolled to, which
       can be the Pac-Man D-pad. It has made its point after a few seconds, and
       the tray badge, the desktop icon and the section link all still lead back
       to it, so it stands down on its own. */
    if(isFlow()) setTimeout(function(){ if(!qqRead) hideQq(); }, 12000);
  }

  function hideQq(){
    if(qq.hidden) return;
    qq.classList.remove("in");
    if(reduced){ qq.hidden = true; return; }
    qq.classList.add("out");
    setTimeout(function(){ qq.hidden = true; qq.classList.remove("out"); }, 220);
  }

  function markQqRead(){
    qqRead = true;
    if(qqTimer){ clearTimeout(qqTimer); qqTimer = null; }
    qq.classList.remove("unread");
    qqBadge.classList.add("live");        /* the icon stays as the way back in */
    qqBadge.classList.remove("unread");
    qqBadge.setAttribute("aria-label", "Open Recruiter View");
    hideQq();
  }

  document.getElementById("qqOpen").addEventListener("click", function(){ openRecruiter(); });
  qq.querySelector(".qq-body").addEventListener("click", function(){ openRecruiter(); });
  document.getElementById("qqClose").addEventListener("click", function(e){
    e.stopPropagation();
    hideQq();                      /* dismissed, but still unread in the tray */
  });
  qqBadge.addEventListener("click", function(){ openRecruiter(); });
  qq.addEventListener("keydown", function(e){
    if(e.key === "Escape"){ hideQq(); }
  });

/* ------------------------------------------------------------------
   HY-OS · PAC-MAN
   Self-contained tile-based Pac-Man. No globals beyond what the host
   IIFE closes over, no DOM per tile, one rAF loop that only runs while
   the window is actually on screen.

   Gameplay behaviour (mode timeline, ghost targeting, ghost-eat scoring)
   follows the documented behaviour of the 1980 arcade game; no code was
   copied from any implementation.
   ------------------------------------------------------------------ */

var PAC_MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "XXXXX#.##### ## #####.#XXXXX",
  "XXXXX#.##          ##.#XXXXX",
  "XXXXX#.## ###--### ##.#XXXXX",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "XXXXX#.## ######## ##.#XXXXX",
  "XXXXX#.##          ##.#XXXXX",
  "XXXXX#.## ######## ##.#XXXXX",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......PP.......##..o#",
  "###.##.##.########.##.##.###",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################"
];

function PacmanApp(opts){
  var COLS = 28, ROWS = 31, TILE = 8;
  var W = COLS * TILE, H = ROWS * TILE;
  var TUNNEL_ROW = 14;
  var HUD_H = 0;                       /* the HUD lives in the DOM, not the canvas */

  var STATE = { MENU:"menu", READY:"ready", PLAYING:"playing", PAUSED:"paused",
                DYING:"dying", LEVEL_COMPLETE:"level_complete", GAME_OVER:"game_over" };

  var DIRS = {
    up:    {x: 0, y:-1, name:"up"},
    left:  {x:-1, y: 0, name:"left"},
    down:  {x: 0, y: 1, name:"down"},
    right: {x: 1, y: 0, name:"right"}
  };
  /* classic tie-break order when two routes are equally close */
  var PREF = [DIRS.up, DIRS.left, DIRS.down, DIRS.right];
  function opposite(d){
    if(!d) return null;
    return d === DIRS.up ? DIRS.down : d === DIRS.down ? DIRS.up
         : d === DIRS.left ? DIRS.right : DIRS.left;
  }
