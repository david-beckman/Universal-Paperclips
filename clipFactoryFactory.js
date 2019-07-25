var clipFactoryFactory = function(initial) {
  const InitialClips = 0;

  const TicksPerSecond = 1000;
  const CPSInterval = 500;

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
    bind: function(save, clipsSpanId, makeClipButton, clipsPerSecondSpanId) {
      if (save) _clipsUpdatedCallbacks.push(save);

      const DefaultClipsSpanId = "clipsSpan";
      const DefaultMakeClipButtonId = "makeClipButton";
      const DefaultClipsPerSecondSpanId = "clipsPerSecondSpan";

      var clipsSpan = document.getElementById(clipsSpanId || DefaultClipsSpanId);
      var button = document.getElementById(makeClipButton || DefaultMakeClipButtonId);
      var cpsSpan = document.getElementById(clipsPerSecondSpanId || DefaultClipsPerSecondSpanId);

      var syncClipsSpan;
      (syncClipsSpan = function() { clipsSpan.innerText = _clips.toLocaleString(); })();

      button.onclick = function() {
        make();
        syncClipsSpan();
      };

      var setpoint = _clips;
      setInterval(function() {
        var cps = (_clips - setpoint) * TicksPerSecond / CPSInterval;
        cpsSpan.innerText = cps.toLocaleString();
        setpoint = _clips;
      }, CPSInterval);
    },
    addClipsUpdatedCallback: function(callback) {
      if (callback) _clipsUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return { clips: _clips };
    }
  };
};
