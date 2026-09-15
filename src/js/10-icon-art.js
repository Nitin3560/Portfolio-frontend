  /* ---------- icon art (original, chunky 16px grid) ---------- */
  function svg(inner){
    return '<svg viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges">'+inner+'</svg>';
  }
  var ART = {
    pacman: svg('<rect x="4" y="2" width="7" height="1" fill="#FFD34E"/>'+
      '<rect x="3" y="3" width="9" height="1" fill="#FFD34E"/><rect x="2" y="4" width="10" height="2" fill="#FFD34E"/>'+
      '<rect x="1" y="6" width="8" height="1" fill="#FFD34E"/><rect x="1" y="7" width="6" height="2" fill="#FFD34E"/>'+
      '<rect x="1" y="9" width="8" height="1" fill="#FFD34E"/><rect x="2" y="10" width="10" height="2" fill="#FFD34E"/>'+
      '<rect x="3" y="12" width="9" height="1" fill="#FFD34E"/><rect x="4" y="13" width="7" height="1" fill="#FFD34E"/>'+
      '<rect x="5" y="4" width="2" height="2" fill="#221A46"/>'+
      '<rect x="12" y="7" width="2" height="2" fill="#F6E7C8"/>'),
    about: svg('<rect x="3" y="1" width="10" height="14" fill="#FBFAFD"/><rect x="3" y="1" width="10" height="2" fill="#6B3FA0"/>'+
      '<rect x="5" y="5" width="6" height="1" fill="#514A63"/><rect x="5" y="7" width="6" height="1" fill="#514A63"/>'+
      '<rect x="5" y="9" width="4" height="1" fill="#514A63"/><rect x="5" y="11" width="5" height="1" fill="#E85A9B"/>'+
      '<rect x="3" y="1" width="1" height="14" fill="#413A52"/><rect x="12" y="1" width="1" height="14" fill="#413A52"/>'+
      '<rect x="3" y="14" width="10" height="1" fill="#413A52"/>'),
    experience: svg('<rect x="1" y="5" width="14" height="9" fill="#6B3FA0"/><rect x="1" y="5" width="14" height="1" fill="#9A76C9"/>'+
      '<rect x="6" y="2" width="4" height="2" fill="#F5A657"/><rect x="5" y="3" width="6" height="2" fill="#F5A657"/>'+
      '<rect x="1" y="9" width="14" height="1" fill="#3A2668"/><rect x="7" y="8" width="2" height="3" fill="#E85A9B"/>'),
    projects: svg('<rect x="1" y="3" width="6" height="2" fill="#F5A657"/><rect x="1" y="4" width="14" height="10" fill="#F5A657"/>'+
      '<rect x="1" y="6" width="14" height="8" fill="#FFC98A"/><rect x="1" y="13" width="14" height="1" fill="#C77A2E"/>'+
      '<rect x="4" y="8" width="8" height="1" fill="#8A5A1E"/><rect x="4" y="10" width="5" height="1" fill="#8A5A1E"/>'),
    skills: svg('<rect x="4" y="4" width="8" height="8" fill="#221A46"/><rect x="6" y="6" width="4" height="4" fill="#6FD6E8"/>'+
      '<rect x="2" y="5" width="2" height="1" fill="#F5A657"/><rect x="2" y="8" width="2" height="1" fill="#F5A657"/>'+
      '<rect x="2" y="11" width="2" height="1" fill="#F5A657"/><rect x="12" y="5" width="2" height="1" fill="#F5A657"/>'+
      '<rect x="12" y="8" width="2" height="1" fill="#F5A657"/><rect x="12" y="11" width="2" height="1" fill="#F5A657"/>'+
      '<rect x="5" y="2" width="1" height="2" fill="#F5A657"/><rect x="10" y="2" width="1" height="2" fill="#F5A657"/>'+
      '<rect x="5" y="12" width="1" height="2" fill="#F5A657"/><rect x="10" y="12" width="1" height="2" fill="#F5A657"/>'),
    education: svg('<rect x="1" y="6" width="14" height="2" fill="#3A2668"/><rect x="3" y="4" width="10" height="2" fill="#6B3FA0"/>'+
      '<rect x="6" y="2" width="4" height="2" fill="#9A76C9"/><rect x="4" y="8" width="8" height="5" fill="#E85A9B"/>'+
      '<rect x="4" y="8" width="8" height="1" fill="#F58FBB"/><rect x="13" y="7" width="1" height="5" fill="#F5A657"/>'),
    contact: svg('<rect x="1" y="4" width="14" height="9" fill="#FBFAFD"/><rect x="1" y="4" width="14" height="1" fill="#413A52"/>'+
      '<rect x="1" y="12" width="14" height="1" fill="#413A52"/><rect x="1" y="4" width="1" height="9" fill="#413A52"/>'+
      '<rect x="14" y="4" width="1" height="9" fill="#413A52"/><path d="M2 5 L8 9 L14 5 L14 6 L8 10 L2 6 Z" fill="#E85A9B"/>'),
    resume: svg('<rect x="3" y="1" width="10" height="14" fill="#FBFAFD"/><rect x="3" y="1" width="10" height="1" fill="#413A52"/>'+
      '<rect x="3" y="14" width="10" height="1" fill="#413A52"/><rect x="3" y="1" width="1" height="14" fill="#413A52"/>'+
      '<rect x="12" y="1" width="1" height="14" fill="#413A52"/><rect x="5" y="3" width="6" height="3" fill="#E85A9B"/>'+
      '<rect x="5" y="8" width="6" height="1" fill="#514A63"/><rect x="5" y="10" width="6" height="1" fill="#514A63"/>'+
      '<rect x="5" y="12" width="3" height="1" fill="#514A63"/>')

    ,research: svg('<rect x="2" y="2" width="12" height="12" fill="#221A46"/><rect x="3" y="3" width="10" height="2" fill="#6B3FA0"/>'+ 
      '<rect x="4" y="7" width="2" height="2" fill="#6FD6E8"/><rect x="7" y="6" width="2" height="2" fill="#F5A657"/><rect x="10" y="8" width="2" height="2" fill="#E85A9B"/>'+ 
      '<rect x="5" y="8" width="3" height="1" fill="#FBFAFD"/><rect x="8" y="7" width="3" height="1" fill="#FBFAFD"/><rect x="6" y="11" width="4" height="1" fill="#9A76C9"/>')
    ,thesis: svg('<rect x="3" y="1" width="10" height="14" fill="#FBFAFD"/><rect x="3" y="1" width="10" height="2" fill="#3A2668"/>'+ 
      '<rect x="5" y="5" width="6" height="1" fill="#514A63"/><rect x="5" y="7" width="6" height="1" fill="#514A63"/><rect x="5" y="9" width="5" height="1" fill="#514A63"/>'+ 
      '<rect x="5" y="12" width="3" height="1" fill="#E85A9B"/><rect x="11" y="11" width="2" height="3" fill="#F5A657"/>')
    ,recruiter: svg('<rect x="1" y="2" width="14" height="11" fill="#FBFAFD"/><rect x="1" y="2" width="14" height="2" fill="#3A2668"/><rect x="3" y="6" width="10" height="1" fill="#514A63"/><rect x="3" y="8" width="10" height="1" fill="#514A63"/><rect x="3" y="10" width="6" height="1" fill="#E85A9B"/><rect x="11" y="9" width="4" height="4" fill="#F5A657"/>')
    ,terminal: svg('<rect x="1" y="2" width="14" height="12" fill="#0B0718"/><rect x="1" y="2" width="14" height="2" fill="#3A2668"/><rect x="3" y="7" width="2" height="1" fill="#6FD6E8"/><rect x="4" y="8" width="2" height="1" fill="#6FD6E8"/><rect x="3" y="9" width="2" height="1" fill="#6FD6E8"/><rect x="7" y="11" width="5" height="1" fill="#F5A657"/>')
    ,player: svg('<rect x="1" y="3" width="14" height="10" fill="#E85A9B"/><rect x="2" y="4" width="12" height="4" fill="#FBFAFD"/><rect x="3" y="5" width="10" height="1" fill="#C7C3CF"/><rect x="4" y="9" width="8" height="3" fill="#221A46"/><rect x="5" y="10" width="2" height="1" fill="#6FD6E8"/><rect x="9" y="10" width="2" height="1" fill="#6FD6E8"/><rect x="1" y="12" width="14" height="1" fill="#8A2F70"/>')
    ,gmail: svg('<rect x="1" y="3" width="14" height="10" fill="#FBFAFD"/><rect x="1" y="3" width="14" height="1" fill="#413A52"/><rect x="1" y="12" width="14" height="1" fill="#413A52"/><rect x="1" y="3" width="1" height="10" fill="#413A52"/><rect x="14" y="3" width="1" height="10" fill="#413A52"/><path d="M2 4 L8 9 L14 4 L14 6 L8 11 L2 6 Z" fill="#F5A657"/><rect x="2" y="4" width="2" height="8" fill="#E85A9B"/>')
    ,outlook: svg('<rect x="1" y="2" width="14" height="12" fill="#3A2668"/><rect x="2" y="3" width="12" height="1" fill="#5A3F94"/><rect x="7" y="5" width="7" height="7" fill="#FBFAFD"/><path d="M7 5 L10.5 8 L14 5 L14 6 L10.5 9 L7 6 Z" fill="#6B3FA0"/><rect x="2" y="4" width="4" height="9" fill="#6FD6E8"/><rect x="3" y="7" width="2" height="3" fill="#221A46"/>')
    ,repo: svg('<rect x="1" y="1" width="14" height="14" fill="#221A46"/><rect x="2" y="2" width="12" height="1" fill="#3E2C6B"/><rect x="5" y="3" width="1" height="10" fill="#6FD6E8"/><rect x="4" y="2" width="3" height="3" fill="#6FD6E8"/><rect x="4" y="11" width="3" height="3" fill="#6FD6E8"/><rect x="6" y="6" width="4" height="1" fill="#E85A9B"/><rect x="9" y="6" width="1" height="5" fill="#E85A9B"/><rect x="8" y="10" width="3" height="3" fill="#E85A9B"/>')
    ,github: svg('<rect x="1" y="1" width="14" height="14" fill="#221A46"/><rect x="2" y="2" width="12" height="1" fill="#3E2C6B"/><rect x="7" y="3" width="1" height="10" fill="#6FD6E8"/><rect x="6" y="2" width="3" height="3" fill="#6FD6E8"/><rect x="6" y="11" width="3" height="3" fill="#6FD6E8"/><rect x="8" y="6" width="4" height="1" fill="#E85A9B"/><rect x="11" y="6" width="1" height="5" fill="#E85A9B"/><rect x="10" y="10" width="3" height="3" fill="#E85A9B"/><rect x="0" y="10" width="6" height="6" fill="#413A52"/><rect x="1" y="11" width="4" height="4" fill="#FBFAFD"/><rect x="2" y="13" width="1" height="1" fill="#3A2668"/><rect x="3" y="12" width="1" height="1" fill="#3A2668"/><rect x="3" y="11" width="2" height="1" fill="#3A2668"/><rect x="4" y="11" width="1" height="2" fill="#3A2668"/>')
    ,linkedin: svg('<rect x="1" y="1" width="14" height="14" fill="#3A2668"/><rect x="2" y="2" width="12" height="1" fill="#5A3F94"/><rect x="5" y="4" width="2" height="2" fill="#6FD6E8"/><rect x="5" y="7" width="2" height="5" fill="#FBFAFD"/><rect x="9" y="7" width="2" height="5" fill="#FBFAFD"/><rect x="11" y="7" width="2" height="2" fill="#FBFAFD"/><rect x="13" y="7" width="2" height="5" fill="#FBFAFD"/><rect x="0" y="10" width="6" height="6" fill="#413A52"/><rect x="1" y="11" width="4" height="4" fill="#FBFAFD"/><rect x="2" y="13" width="1" height="1" fill="#3A2668"/><rect x="3" y="12" width="1" height="1" fill="#3A2668"/><rect x="3" y="11" width="2" height="1" fill="#3A2668"/><rect x="4" y="11" width="1" height="2" fill="#3A2668"/>')
  };
  var LINKS = [
    {k:"github",   label:"GitHub",   url:"https://github.com/Nitin3560"},
    {k:"linkedin", label:"LinkedIn", url:"https://www.linkedin.com/in/nitin-singh-rathore/"}
  ];
  var LABEL = {
    about:"README.TXT", experience:"Experience", projects:"Projects", research:"Research", thesis:"Thesis",
    skills:"Skills", education:"Education", contact:"Contact", resume:"Resume.pdf",
    player:"Player", terminal:"Terminal", pacman:"Pac-Man", recruiter:"Recruiter View",
    attic:"Attic", dex:"Signal"
  };
  /* Reading order is the point: a recruiter meets the work before the toys.
     The terminal, player and game stay — they are the evidence — but they no
     longer greet you before the résumé does. */
  var WORK = ["about","projects","research","thesis","experience","skills","education","resume","contact","recruiter"];
  var PLAY = ["terminal","player","pacman"];
  var ORDER = WORK.concat(PLAY);
  /* The attic is a window the shell has to know about — taskbar button, fold
     control, focus handling — without being anywhere a visitor can find it. */
  var ALLWINS = ORDER.concat(["attic", "dex"]);

  var wins = {}, z = 10;
  Array.prototype.forEach.call(document.querySelectorAll(".win"), function(w){
    wins[w.dataset.win] = w;
  });

