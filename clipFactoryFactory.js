var clipFactoryFactory = function(wireSupplier, initial) {
  if (!wireSupplier || !wireSupplier.use || !wireSupplier.canUse || !wireSupplier.addLengthUpdatedCallback) {
    console.assert(false, "No wire supplier hooked to the factory.");
    return false;
  }

  const InitialClips = 0;

  const WirePerClip = 1;
  const TicksPerSecond = 1000;
  const CPSInterval = 500;

  var _clips = (initial && initial.clips) || InitialClips;
  var _clipsUpdatedCallbacks = [];

  var _button;
  wireSupplier.addLengthUpdatedCallback(function() {
    if (!_button) return;
    _button.disabled = !wireSupplier.canUse(WirePerClip);
  });

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
      _button = document.getElementById(makeClipButton || DefaultMakeClipButtonId);
      var cpsSpan = document.getElementById(clipsPerSecondSpanId || DefaultClipsPerSecondSpanId);

      var syncClipsSpan;
      (syncClipsSpan = function() { clipsSpan.innerText = _clips.toLocaleString(); })();

      _button.onclick = function() {
        if (!wireSupplier.use(WirePerClip)) {
          console.warn("Insufficient wire to make a new clip.");
          return false;
        }

        _clips++;
        syncClipsSpan();
        _clipsUpdatedCallbacks.forEach(function(callback) {
          setTimeout(function() { callback(_clips); }, 0);
        });
        return true;
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
