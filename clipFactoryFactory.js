var clipFactoryFactory = function(initial) {
  const InitialClips = 0;

  var _clips = (initial && initial.clips) || InitialClips;
  var _clipsUpdatedCallbacks = [];

  var make = function() {
    _clips++;
    _clipsUpdatedCallbacks.forEach(function(callback) {
      setTimeout(function() { callback(_clips); }, 0);
    });
  };

  return {
    getClips: function() {
      return _clips;
    },
    bind: function(save, paperclipsSpanId, makePaperclipButton) {
      if (save) _clipsUpdatedCallbacks.push(save);

      const DefaultPaperclipsSpanId = "clipsSpan";
      const DefaultMakePaperclipButtonId = "makeClipButton"

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
};
