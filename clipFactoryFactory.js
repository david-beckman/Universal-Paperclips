var clipFactoryFactory = function() {
  const InitialClips = 0;

  const DefaultPaperclipsSpanId = "paperclipsSpan";
  const DefaultMakePaperclipButtonId = "makePaperclipButton"

  var _clips = InitialClips;
  var _clipsUpdatedCallbacks = [];

  var makeClip = function() {
    _clips++;
    _clipsUpdatedCallbacks.forEach(function(callback) {
        callback(_clips);
    });
  };

  return {
    bind: function(paperclipsSpanId, makePaperclipButton) {
      var span = document.getElementById(paperclipsSpanId || DefaultPaperclipsSpanId);
      var button = document.getElementById(makePaperclipButton || DefaultMakePaperclipButtonId);

      var syncSpan;
      (syncSpan = function() { span.innerText = _clips.toLocaleString(); })();

      button.onclick = function() {
        makeClip();
        syncSpan();
      };
    },
    addClipsUpdatedCallback(callback) {
      if (callback) _clipsUpdatedCallbacks.push(callback);
    }
  };
}
