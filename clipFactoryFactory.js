var clipFactoryFactory = function(initial) {
  const InitialClips = 0;

  const DefaultPaperclipsSpanId = "paperclipsSpan";
  const DefaultMakePaperclipButtonId = "makePaperclipButton"

  var _clips = (initial && initial.clips) || InitialClips;
  var _clipsUpdatedCallbacks = [];

  var make = function() {
    _clips++;
    _clipsUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_clips); }, 0);
    });
  };

  return {
    bind: function(save, paperclipsSpanId, makePaperclipButton) {
      if (save) _clipsUpdatedCallbacks.push(save);

      var span = document.getElementById(paperclipsSpanId || DefaultPaperclipsSpanId);
      var button = document.getElementById(makePaperclipButton || DefaultMakePaperclipButtonId);

      var syncSpan;
      (syncSpan = function() { span.innerText = _clips.toLocaleString(); })();

      button.onclick = function() {
        make();
        syncSpan();
      };
    },
    addClipsUpdatedCallback: function(callback) {
      if (callback) _clipsUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return { clips: _clips };
    }
  };
}
