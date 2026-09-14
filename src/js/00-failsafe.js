<script>
/* Failsafe. If the main script throws before it can lay the desktop out, the page
   would otherwise render blank — every window starts display:none. This flips the
   document into the plain stacked layout instead. */
(function(){
  function fail(){ document.documentElement.classList.add("js-failed"); }
  window.addEventListener("error", function(e){
    /* Capture-phase "error" also fires for any subresource that fails to load —
       a missing mp3, a blocked webfont, a 404 image. Those must not tear the
       desktop down: one absent track is not a dead script. A real exception has
       no element target (or carries e.error), and only that counts. */
    if(e && e.target && e.target !== window && e.target.nodeName && !e.error) return;
    fail();
  }, true);
  setTimeout(function(){ if(!document.querySelector(".win.open")) fail(); }, 2500);
})();
</script>

