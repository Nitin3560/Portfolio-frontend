  var canvas = opts.canvas, ctx = canvas.getContext("2d", {alpha:false});
  var hud = opts.hud;
  var reduced = !!opts.reduced;

  /* ---------- palette: the site's own tokens ---------- */
  var C = {
    bg:      "#120E28",
    wall:    "#6FD6E8",
    wallDim: "#2A3A7A",
    door:    "#E85A9B",
    pellet:  "#F6E7C8",
    power:   "#F5A657",
    pac:     "#FFD34E",
    text:    "#F6E7C8",
    blinky:  "#E85A9B",
    pinky:   "#F2A8D0",
    inky:    "#6FD6E8",
    clyde:   "#F5A657",
    fright:  "#3A57C8",
    frightF: "#F1EFF6",
    eyes:    "#FBFAFD",
    pupil:   "#221A46"
  };

  /* ---------- level grid ---------- */
  var grid, pellets, pelletsLeft, totalPellets;
  function isWallChar(c){ return c === "#" || c === "X"; }
  function tileAt(x, y){
    if(y < 0 || y >= ROWS) return "#";
    if(x < 0 || x >= COLS) return (y === TUNNEL_ROW) ? " " : "#";
    return grid[y][x];
  }
  /* `who` may pass through the ghost-house door only while leaving or eaten */
  function passable(x, y, who){
    var c = tileAt(x, y);
    if(c === "-") return !!(who && (who.mode === "leaving" || who.mode === "eaten"));
    return !isWallChar(c);
  }
  function wrapX(x){ return x < 0 ? COLS - 1 : x >= COLS ? 0 : x; }

  function buildLevel(){
    grid = PAC_MAZE.map(function(r){ return r.split(""); });
    pellets = [];
    totalPellets = 0;
    for(var y = 0; y < ROWS; y++){
      pellets[y] = [];
      for(var x = 0; x < COLS; x++){
        var c = grid[y][x];
        pellets[y][x] = (c === "." ? 1 : c === "o" ? 2 : 0);
        if(pellets[y][x]) totalPellets++;
      }
    }
    pelletsLeft = totalPellets;
    paintMaze();
    paintPellets();
  }

  /* ---------- static layers, drawn once per level ---------- */
  var mazeLayer = document.createElement("canvas");
  var pelletLayer = document.createElement("canvas");
  mazeLayer.width = pelletLayer.width = W;
  mazeLayer.height = pelletLayer.height = H;
  var mg = mazeLayer.getContext("2d"), pg = pelletLayer.getContext("2d");

  function paintMaze(){
    mg.clearRect(0, 0, W, H);
    /* Walls are drawn as the boundary between wall and corridor, which is what
       makes a Pac-Man maze read as a Pac-Man maze rather than a block of tiles. */
    mg.strokeStyle = C.wall;
    mg.lineWidth = 1;
    mg.lineCap = "round";
    /* a neon-sign bloom on the walls. It is baked into the prerendered layer,
       so it costs nothing per frame — and stays low enough not to smear. */
    mg.shadowColor = "rgba(111,214,232,.75)";
    mg.shadowBlur = 2.2;
    for(var y = 0; y < ROWS; y++){
      for(var x = 0; x < COLS; x++){
        if(!isWallChar(grid[y][x])) continue;
        var px = x * TILE, py = y * TILE;
        /* a wall edge is drawn only where it faces something walkable */
        if(!isWallChar(tileAt(x, y - 1))) seg(px, py + 0.5, px + TILE, py + 0.5);
        if(!isWallChar(tileAt(x, y + 1))) seg(px, py + TILE - 0.5, px + TILE, py + TILE - 0.5);
        if(!isWallChar(tileAt(x - 1, y))) seg(px + 0.5, py, px + 0.5, py + TILE);
        if(!isWallChar(tileAt(x + 1, y))) seg(px + TILE - 0.5, py, px + TILE - 0.5, py + TILE);
      }
    }
    /* ghost-house door */
    mg.strokeStyle = C.door; mg.lineWidth = 1.5;
    mg.shadowColor = "rgba(232,90,155,.7)";
    for(y = 0; y < ROWS; y++) for(x = 0; x < COLS; x++){
      if(grid[y][x] === "-") seg(x * TILE, y * TILE + TILE / 2, x * TILE + TILE, y * TILE + TILE / 2);
    }
    function seg(a, b, c2, d){ mg.beginPath(); mg.moveTo(a, b); mg.lineTo(c2, d); mg.stroke(); }
  }

  function paintPellets(){
    pg.clearRect(0, 0, W, H);
    pg.fillStyle = C.pellet;
    for(var y = 0; y < ROWS; y++) for(var x = 0; x < COLS; x++){
      if(pellets[y][x] === 1) pg.fillRect(x * TILE + 3, y * TILE + 3, 2, 2);
    }
  }
  function clearPellet(x, y){ pg.clearRect(x * TILE, y * TILE, TILE, TILE); }

  /* ---------- entities ----------
     Position is a tile plus a 0..1 progress toward the next tile in `dir`.
     Nothing is ever compared with floating-point pixel coordinates, so a
     turn or a collision cannot land "between" tiles. */
  function Entity(tx, ty, dir){
    this.tx = tx; this.ty = ty;
    this.dir = dir || null; this.next = null;
    this.prog = 0; this.speed = 8;
  }
  Entity.prototype.aheadTile = function(){
    if(!this.dir) return {x:this.tx, y:this.ty};
    return {x: wrapX(this.tx + this.dir.x), y: this.ty + this.dir.y};
  };
  Entity.prototype.px = function(){
    var cx = this.tx * TILE + TILE / 2, cy = this.ty * TILE + TILE / 2;
    if(!this.dir) return {x:cx, y:cy};
    return {x: cx + this.dir.x * this.prog * TILE, y: cy + this.dir.y * this.prog * TILE};
  };

  var pac, ghosts;

  function makePac(){
    var p = new Entity(13, 23, DIRS.left);
    p.prog = 0.5; p.mouth = 0; p.dead = 0;
    return p;
  }
  function makeGhosts(){
    function G(name, color, tx, ty, scatter, mode){
      var g = new Entity(tx, ty, DIRS.up);
      g.name = name; g.color = color; g.scatter = scatter;
      g.mode = mode;                     /* house | leaving | normal | eaten */
      g.home = {x:tx, y:ty};
      g.bob = 0;
      return g;
    }
    return [
      G("blinky", C.blinky, 13, 11, {x:COLS - 2, y:0},     "normal"),
      G("pinky",  C.pinky,  13, 14, {x:1, y:0},            "house"),
      G("inky",   C.inky,   11, 14, {x:COLS - 1, y:ROWS-1},"house"),
      G("clyde",  C.clyde,  15, 14, {x:0, y:ROWS - 1},     "house")
    ];
  }

  /* ---------- game state ---------- */
  var state = STATE.MENU;
  var score = 0, lives = 3, level = 1, high = 0;
  var ghostCombo = 0, frightT = 0, stateT = 0, modeIdx = 0, modeT = 0, globalPellets = 0;
  var extraAwarded = false;

  var MODES = [ ["scatter",7], ["chase",20], ["scatter",7], ["chase",20],
                ["scatter",5], ["chase",20], ["scatter",5], ["chase",1e9] ];

  function loadHigh(){
    try{ var v = window.localStorage.getItem("pacman_high_score");
         high = v ? (parseInt(v, 10) || 0) : 0; }
    catch(e){ high = 0; }                 /* private mode / storage disabled */
  }
  function saveHigh(){
    try{ window.localStorage.setItem("pacman_high_score", String(high)); }catch(e){}
  }

  function frightDuration(){ return Math.max(1, 7 - (level - 1) * 0.5); }
  function pacSpeed(){ return Math.min(10.5, 7.6 + (level - 1) * 0.25); }
  function ghostSpeed(){ return Math.min(10, 7.1 + (level - 1) * 0.28); }

  function resetPositions(){
    pac = makePac();
    ghosts = makeGhosts();
    modeIdx = 0; modeT = 0; frightT = 0; ghostCombo = 0;
    setState(STATE.READY);
  }
  function newGame(){
    score = 0; lives = 3; level = 1; globalPellets = 0; extraAwarded = false;
    buildLevel(); resetPositions(); syncHud();
  }
  function nextLevel(){
    level++; globalPellets = 0;
    if(opts.onLevel) opts.onLevel(level);
    buildLevel(); resetPositions(); syncHud();
  }
  function setState(s){ state = s; stateT = 0; syncHud(); }

  /* ---------- HUD (DOM, written only when a value changes) ---------- */
  var lastHud = {};
  function syncHud(){
    put(hud.score, String(score).padStart(6, "0"));
    put(hud.high,  String(high).padStart(6, "0"));
    put(hud.level, String(level).padStart(2, "0"));
    var hearts = "";
    for(var i = 0; i < Math.max(0, lives); i++) hearts += "●";
    put(hud.lives, hearts || "–");
    var msg = state === STATE.MENU ? "PRESS START"
            : state === STATE.READY ? "READY!"
            : state === STATE.PAUSED ? "PAUSED"
            : state === STATE.GAME_OVER ? "GAME OVER"
            : state === STATE.LEVEL_COMPLETE ? "LEVEL CLEAR"
            : "";
    put(hud.msg, msg);
    if(hud.msgWrap) hud.msgWrap.hidden = !msg;
  }
  function put(el, v){
    if(!el) return;
    if(lastHud[el.id] === v) return;
    lastHud[el.id] = v; el.textContent = v;
  }

  /* ---------- sound: borrows the page's context, never makes its own ---- */
  var soundOn = false, sfxGain = null;
  function beep(freq, dur, type, vol){
    if(!soundOn) return;
    var ac = opts.getAudioContext && opts.getAudioContext();
    if(!ac || ac.state !== "running") return;
    try{
      if(!sfxGain){ sfxGain = ac.createGain(); sfxGain.gain.value = 0.06; sfxGain.connect(ac.destination); }
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "square"; o.frequency.value = freq;
      g.gain.setValueAtTime(vol == null ? 0.9 : vol, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      o.connect(g); g.connect(sfxGain);
      o.start(); o.stop(ac.currentTime + dur + 0.02);
    }catch(e){}                            /* sound must never break the game */
  }
  this.setSound = function(on){
    soundOn = !!on;
    if(on) beep(880, 0.05);
    return soundOn;
  };
  this.soundAvailable = function(){
    var ac = opts.getAudioContext && opts.getAudioContext();
    return !!ac;
  };

  /* ---------- movement ---------- */
  function stepEntity(e, dt, chooser){
    if(!e.dir){ chooser(e); if(!e.dir) return; }
    e.prog += e.speed * dt;
    var guard = 0;
    while(e.prog >= 1 && guard++ < 8){
      e.prog -= 1;
      var a = e.aheadTile();
      e.tx = a.x; e.ty = a.y;
      if(e.ty === TUNNEL_ROW) e.tx = wrapX(e.tx);
      onArrive(e);
      chooser(e);
      if(!e.dir){ e.prog = 0; break; }
    }
  }
  function onArrive(e){
    if(e !== pac) return;
    var p = pellets[e.ty] && pellets[e.ty][e.tx];
    if(p === 1){
      pellets[e.ty][e.tx] = 0; pelletsLeft--; globalPellets++;
      addScore(10); clearPellet(e.tx, e.ty);
      beep(520 + (globalPellets % 2) * 110, 0.045, "square", 0.5);
      releaseCheck();
    } else if(p === 2){
      pellets[e.ty][e.tx] = 0; pelletsLeft--; globalPellets++;
      addScore(50); clearPellet(e.tx, e.ty);
      frightT = frightDuration(); ghostCombo = 0;
      ghosts.forEach(function(g){
        if(g.mode === "normal"){ g.dir = opposite(g.dir) || g.dir; }
      });
      beep(180, 0.22, "sawtooth", 0.6);
      releaseCheck();
    }
    if(pelletsLeft <= 0) setState(STATE.LEVEL_COMPLETE);
  }
  function addScore(n){
    score += n;
    if(!extraAwarded && score >= 10000){ extraAwarded = true; lives++; beep(1200, 0.18); }
    if(score > high){ high = score; saveHigh(); }
    syncHud();
  }
  /* Pinky leaves at once, Inky and Clyde wait for the level to get going. */
  function releaseCheck(){
    ghosts.forEach(function(g){
      if(g.mode !== "house") return;
      var need = g.name === "pinky" ? 0 : g.name === "inky" ? 30 : 60;
      if(globalPellets >= need) g.mode = "leaving";
    });
  }

  function choosePac(e){
    if(e.next && passable(wrapX(e.tx + e.next.x), e.ty + e.next.y, e)){
      e.dir = e.next; e.next = null; return;
    }
    if(e.dir && passable(wrapX(e.tx + e.dir.x), e.ty + e.dir.y, e)) return;
    e.dir = null;                                   /* nose against a wall */
  }
  function requestDir(d){
    if(!pac) return;
    /* An about-face is legal anywhere: flip the segment we are on rather than
       waiting for the next tile, which is what makes the controls feel tight. */
    if(pac.dir && d === opposite(pac.dir) && pac.prog > 0){
      var a = pac.aheadTile();
      pac.tx = a.x; pac.ty = a.y; pac.prog = 1 - pac.prog; pac.dir = d; pac.next = null;
      return;
    }
    if(!pac.dir && passable(wrapX(pac.tx + d.x), pac.ty + d.y, pac)){ pac.dir = d; pac.next = null; return; }
    pac.next = d;
  }

  function ghostTarget(g){
    if(g.mode === "eaten") return {x:13, y:11};
    if(frightT > 0 && g.mode === "normal") return null;          /* wander */
    if(MODES[modeIdx][0] === "scatter") return g.scatter;
    var pt = {x:pac.tx, y:pac.ty}, d = pac.dir || DIRS.left;
    if(g.name === "blinky") return pt;
    if(g.name === "pinky")  return {x: pt.x + d.x * 4, y: pt.y + d.y * 4};
    if(g.name === "inky"){
      var b = ghosts[0], m = {x: pt.x + d.x * 2, y: pt.y + d.y * 2};
      return {x: m.x + (m.x - b.tx), y: m.y + (m.y - b.ty)};     /* doubled vector */
    }
    var dx = pt.x - g.tx, dy = pt.y - g.ty;
    return (dx * dx + dy * dy > 64) ? pt : g.scatter;            /* Clyde is shy */
  }

  function chooseGhost(g){
    var back = opposite(g.dir), best = null, bestD = Infinity;
    var target = ghostTarget(g);
    var opts2 = [];
    for(var i = 0; i < PREF.length; i++){
      var d = PREF[i];
      if(d === back) continue;
      var nx = wrapX(g.tx + d.x), ny = g.ty + d.y;
      if(!passable(nx, ny, g)) continue;
      opts2.push({d:d, x:nx, y:ny});
    }
    if(!opts2.length){ g.dir = back; return; }                   /* dead end */
    if(!target){                                                 /* frightened */
      g.dir = opts2[(Math.random() * opts2.length) | 0].d; return;
    }
    for(i = 0; i < opts2.length; i++){
      var o = opts2[i], ddx = o.x - target.x, ddy = o.y - target.y;
      var dist = ddx * ddx + ddy * ddy;
      if(dist < bestD){ bestD = dist; best = o.d; }
    }
    g.dir = best;
  }

  function updateGhost(g, dt){
    if(g.mode === "house"){
      g.bob += dt * 3;                                           /* idle bob */
      return;
    }
    if(g.mode === "leaving"){
      /* scripted exit: line up under the door, then rise through it */
      var doorX = 13;
      if(g.ty > 12){
        g.dir = (g.tx === doorX || g.tx === doorX + 1) ? DIRS.up
              : (g.tx < doorX ? DIRS.right : DIRS.left);
      } else { g.dir = DIRS.up; }
      g.speed = 6;
      stepEntity(g, dt, function(){});
      if(g.ty <= 11){ g.mode = "normal"; g.ty = 11; g.prog = 0; g.dir = DIRS.left; }
      return;
    }
    if(g.mode === "eaten"){
      g.speed = 18;
      stepEntity(g, dt, chooseGhost);
      if(g.tx === 13 && g.ty === 11){ g.mode = "leaving"; g.ty = 14; g.tx = 13; g.prog = 0; }
      return;
    }
    var inTunnel = (g.ty === TUNNEL_ROW && (g.tx < 6 || g.tx > 21));
    g.speed = frightT > 0 ? ghostSpeed() * 0.55 : (inTunnel ? ghostSpeed() * 0.5 : ghostSpeed());
    stepEntity(g, dt, chooseGhost);
  }

  function collide(){
    for(var i = 0; i < ghosts.length; i++){
      var g = ghosts[i];
      if(g.mode === "eaten" || g.mode === "house") continue;
      var a = g.px(), b = pac.px();
      var dx = a.x - b.x, dy = a.y - b.y;
      if(dx * dx + dy * dy > 36) continue;                        /* < 6px apart */
      if(frightT > 0 && g.mode === "normal"){
        ghostCombo = Math.min(ghostCombo + 1, 4);
        addScore(200 * Math.pow(2, ghostCombo - 1));
        g.mode = "eaten"; g.speed = 18;
        beep(1000, 0.12, "square", 0.7);
      } else {
        pac.dead = 0; setState(STATE.DYING);
        beep(300, 0.5, "sawtooth", 0.8);
      }
      return;
    }
  }

  /* ---------- update ---------- */
  function update(dt){
    stateT += dt;
    if(state === STATE.READY){
      if(stateT > (reduced ? 0.5 : 1.4)) setState(STATE.PLAYING);
      return;
    }
    if(state === STATE.DYING){
      pac.dead = Math.min(1, stateT / 1.1);
      if(stateT > 1.4){
        lives--;
        if(lives <= 0){ setState(STATE.GAME_OVER); }
        else { resetPositions(); }
      }
      return;
    }
    if(state === STATE.LEVEL_COMPLETE){
      if(stateT > (reduced ? 0.7 : 1.8)) nextLevel();
      return;
    }
    if(state !== STATE.PLAYING) return;

    if(frightT > 0){
      frightT -= dt;
      if(frightT <= 0){ frightT = 0; ghostCombo = 0; }
    } else {
      modeT += dt;
      if(modeT >= MODES[modeIdx][1] && modeIdx < MODES.length - 1){
        modeT = 0; modeIdx++;
        ghosts.forEach(function(g){ if(g.mode === "normal") g.dir = opposite(g.dir) || g.dir; });
      }
    }

    pac.speed = pacSpeed();
    stepEntity(pac, dt, choosePac);
    pac.mouth = (pac.mouth + dt * 11) % (Math.PI * 2);
    for(var i = 0; i < ghosts.length; i++) updateGhost(ghosts[i], dt);
    collide();
  }

  /* ---------- draw ---------- */
  var scale = 2, lastW = 0, lastH = 0;
  function fit(){
    var view = opts.view, host = view && view.parentNode;
    if(!host) return;
    var availW = host.clientWidth;
    if(!availW) return;
    var availH;
    if(opts.flow && opts.flow()){
      /* In the stack the window has no fixed height, so the screen box just
         reports whatever the board is already — asking it would pin the size
         to itself forever. Budget from the viewport instead. */
      availH = Math.min(window.innerHeight * 0.62, availW * H / W);
    } else {
      availH = host.clientHeight;
      if(!availH || availH < 60) availH = availW * H / W;
    }
    var css = Math.min(availW / W, availH / H);
    var cssW = Math.max(112, Math.floor(W * css));
    var cssH = Math.round(cssW * H / W);
    if(cssW !== lastW || cssH !== lastH){
      lastW = cssW; lastH = cssH;
      view.style.width = cssW + "px";
      view.style.height = cssH + "px";
    }
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var want = Math.round(cssW * dpr), wantH = Math.round(cssH * dpr);
    if(canvas.width !== want || canvas.height !== wantH){
      canvas.width = want; canvas.height = wantH;
    }
    scale = canvas.width / W;
  }

  function draw(){
    fit();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
    ctx.imageSmoothingEnabled = false;

    ctx.globalAlpha = state === STATE.LEVEL_COMPLETE && !reduced
      ? (Math.floor(stateT * 8) % 2 ? 0.25 : 1) : 1;
    ctx.drawImage(mazeLayer, 0, 0);
    ctx.globalAlpha = 1;
    ctx.drawImage(pelletLayer, 0, 0);

    /* power pellets pulse; only four, so drawing them live costs nothing */
    var pulse = reduced ? 1 : 0.62 + 0.38 * Math.sin(stateT * 7);
    ctx.fillStyle = C.power;
    for(var y = 0; y < ROWS; y++) for(var x = 0; x < COLS; x++){
      if(pellets[y][x] !== 2) continue;
      var r = 2.4 * pulse + 0.8;
      ctx.beginPath();
      ctx.arc(x * TILE + TILE / 2, y * TILE + TILE / 2, r, 0, 6.2832);
      ctx.fill();
    }

    if(state !== STATE.GAME_OVER && state !== STATE.MENU) drawPac();
    if(state !== STATE.DYING && state !== STATE.MENU) for(var i = 0; i < ghosts.length; i++) drawGhost(ghosts[i]);
  }

  function drawPac(){
    var p = pac.px();
    var open = state === STATE.PLAYING ? (0.20 + 0.20 * Math.abs(Math.sin(pac.mouth))) : 0.25;
    if(state === STATE.DYING) open = 0.02 + pac.dead * 0.98;
    var d = pac.dir || DIRS.left;
    var base = d === DIRS.right ? 0 : d === DIRS.down ? Math.PI / 2
             : d === DIRS.left ? Math.PI : -Math.PI / 2;
    ctx.fillStyle = C.pac;
    ctx.beginPath();
    if(state === STATE.DYING && pac.dead >= 1) return;
    ctx.moveTo(p.x, p.y);
    ctx.arc(p.x, p.y, TILE / 2 + 0.5, base + open * Math.PI, base - open * Math.PI);
    ctx.closePath(); ctx.fill();
  }

  function drawGhost(g){
    var p = g.px(), r = TILE / 2 + 0.5;
    if(g.mode === "house") p.y += Math.sin(g.bob) * 1.2;
    var frightened = frightT > 0 && g.mode === "normal";
    var flashing = frightened && frightT < 2 && !reduced && Math.floor(frightT * 6) % 2 === 0;

    if(g.mode !== "eaten"){
      ctx.fillStyle = frightened ? (flashing ? C.frightF : C.fright) : g.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 0.5, r, Math.PI, 0);
      ctx.lineTo(p.x + r, p.y + r - 1);
      /* three-pointed skirt, the shape everyone recognises */
      ctx.lineTo(p.x + r * 0.33, p.y + r - 2.4);
      ctx.lineTo(p.x, p.y + r - 1);
      ctx.lineTo(p.x - r * 0.33, p.y + r - 2.4);
      ctx.lineTo(p.x - r, p.y + r - 1);
      ctx.closePath(); ctx.fill();
    }
    if(frightened){
      ctx.fillStyle = flashing ? C.fright : C.frightF;
      ctx.fillRect(p.x - 2.2, p.y - 1.4, 1.4, 1.4);
      ctx.fillRect(p.x + 0.9, p.y - 1.4, 1.4, 1.4);
      return;
    }
    var d = g.dir || DIRS.left;
    ctx.fillStyle = C.eyes;
    ctx.beginPath(); ctx.arc(p.x - 1.9, p.y - 1, 1.7, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x + 1.9, p.y - 1, 1.7, 0, 6.2832); ctx.fill();
    ctx.fillStyle = C.pupil;
    ctx.beginPath(); ctx.arc(p.x - 1.9 + d.x * 0.8, p.y - 1 + d.y * 0.8, 0.9, 0, 6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x + 1.9 + d.x * 0.8, p.y - 1 + d.y * 0.8, 0.9, 0, 6.2832); ctx.fill();
  }

  /* ---------- loop: runs only while the window is actually on screen ------- */
  var raf = null, last = 0, running = false;
  function alive(){
    if(!opts.isVisible()) return false;
    return state === STATE.READY || state === STATE.PLAYING
        || state === STATE.DYING || state === STATE.LEVEL_COMPLETE
        || (!reduced && state === STATE.MENU);
  }
  function frame(now){
    raf = null;
    var dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    draw();
    if(alive()) raf = requestAnimationFrame(frame);
    else running = false;
  }
  function kick(){
    if(running || !alive()) { if(!running) draw(); return; }
    running = true; last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function halt(){
    if(raf !== null){ cancelAnimationFrame(raf); raf = null; }
    running = false;
  }

  /* ---------- input ---------- */
  var KEYS = {
    ArrowUp:DIRS.up, ArrowDown:DIRS.down, ArrowLeft:DIRS.left, ArrowRight:DIRS.right,
    w:DIRS.up, a:DIRS.left, s:DIRS.down, d:DIRS.right,
    W:DIRS.up, A:DIRS.left, S:DIRS.down, D:DIRS.right
  };
  function typingInto(t){
    if(!t) return false;
    var n = t.nodeName;
    return n === "INPUT" || n === "TEXTAREA" || n === "SELECT" || t.isContentEditable;
  }
  function onKey(e){
    if(!opts.hasFocus()) return;              /* the rest of the site keeps its keys */
    if(typingInto(e.target)) return;
    if(e.metaKey || e.ctrlKey || e.altKey) return;
    var d = KEYS[e.key];
    if(d){
      e.preventDefault();
      if(state === STATE.MENU || state === STATE.GAME_OVER) start();
      else if(state === STATE.PAUSED) togglePause();
      requestDir(d); kick(); return;
    }
    if(e.key === "p" || e.key === "P"){ e.preventDefault(); togglePause(); return; }
    if(e.key === " " || e.key === "Enter"){
      e.preventDefault();
      if(state === STATE.MENU || state === STATE.GAME_OVER) start();
      else togglePause();
      return;
    }
    if(e.key === "r" || e.key === "R"){ e.preventDefault(); start(); return; }
  }

  var autoPaused = false;
  function start(){ autoPaused = false; newGame(); kick(); }
  function togglePause(){
    autoPaused = false;                    /* from here on the player owns it */
    if(state === STATE.PLAYING){ setState(STATE.PAUSED); halt(); draw(); }
    else if(state === STATE.PAUSED){ setState(STATE.PLAYING); kick(); }
  }

  /* ---------- public surface ---------- */
  this.start = start;
  this.togglePause = togglePause;
  this.press = function(d){
    var m = {up:DIRS.up, down:DIRS.down, left:DIRS.left, right:DIRS.right}[d];
    if(!m) return;
    if(state === STATE.MENU || state === STATE.GAME_OVER){ start(); }
    else if(state === STATE.PAUSED){ togglePause(); }
    requestDir(m); kick();
  };
  this.resume = function(){
    if(autoPaused && state === STATE.PAUSED){ autoPaused = false; setState(STATE.PLAYING); }
    kick(); draw();
  };
  this.suspend = function(){
    halt();
    /* Losing the screen must not cost a life: park the game rather than
       letting the ghosts hunt a player who cannot steer. */
    if(state === STATE.PLAYING){ setState(STATE.PAUSED); autoPaused = true; }
  };
  this.redraw = function(){ draw(); };
  this.state = function(){ return state; };
  this.destroy = function(){
    halt();
    document.removeEventListener("keydown", onKey, false);
  };
