var clipFactoryFactory = function() {
  const InitialClips = 0;

  const DefaultPaperclipsSpanId = "paperclipsSpan";
  const DefaultMakePaperclipButtonId = "makePaperclipButton"

  var _clips = InitialClips;

  return {
    bind: function(paperclipsSpanId, makePaperclipButton) {
      var span = document.getElementById(paperclipsSpanId || DefaultPaperclipsSpanId);
      var button = document.getElementById(makePaperclipButton || DefaultMakePaperclipButtonId);

      var syncSpan;
      (syncSpan = function() { span.innerText = _clips; })();
    
      button.onclick = function() {
        _clips++;
        syncSpan();
      };
    }
  };
}
