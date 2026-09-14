  /* ---------- mobile: collapsible sections + a section nav ---------- */
  var mnav = document.getElementById("mnav");
  var folds = {};
  ALLWINS.forEach(function(k){
    var w = wins[k];
    var bodyEl = w.querySelector(".body");
    bodyEl.id = "body-" + k;
    w.id = "win-" + k;

    var fold = document.createElement("button");
    fold.type = "button";
    fold.className = "fold";
    fold.setAttribute("aria-controls", bodyEl.id);
    fold.setAttribute("aria-expanded", "true");
    fold.setAttribute("aria-labelledby", w.querySelector(".titlebar .t").id);
    fold.addEventListener("click", function(){
      setFold(k, !w.classList.contains("folded"));
    });
    w.querySelector(".titlebar").appendChild(fold);
    folds[k] = fold;

    if(ORDER.indexOf(k) === -1) return;      /* not an app: no section link */
    var a = document.createElement("a");
    a.href = "#win-" + k;
    a.textContent = LABEL[k];
    a.addEventListener("click", function(e){
      e.preventDefault();
      open(k);                       /* Recruiter View is not open by default */
      setFold(k, false);
      w.scrollIntoView({behavior: reduced ? "auto" : "smooth", block: "start"});
    });
    mnav.appendChild(a);
  });


  function mnavHint(){
    mnav.classList.toggle("more", mnav.scrollLeft + mnav.clientWidth < mnav.scrollWidth - 2);
  }
  mnav.addEventListener("scroll", mnavHint, {passive:true});
  window.addEventListener("resize", mnavHint);

  function setFold(k, folded){
    wins[k].classList.toggle("folded", folded);
    folds[k].setAttribute("aria-expanded", folded ? "false" : "true");
    if(k === "player" && typeof startViz === "function"){
      if(folded) stopViz(); else startViz();
    }
    if(k === "pacman" && typeof pacSync === "function") pacSync();
  }

