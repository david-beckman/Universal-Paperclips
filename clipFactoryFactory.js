var clipFactoryFactory = function(wireSupplier, initial) {
  if (!wireSupplier || !wireSupplier.getLength ||  !wireSupplier.use || !wireSupplier.canUse || !wireSupplier.addLengthUpdatedCallback) {
    console.assert(false, "No wire supplier hooked to the factory.");
    return false;
  }

  const InitialClips = 0;

  const WirePerClip = 1;
  const TicksPerSecond = 1000;
  const CPSInterval = TicksPerSecond;

  var _clips = (initial && initial.clips) || InitialClips;
  var _clipsUpdatedCallbacks = [];

  var _span;
  var _button;

  var syncClipsSpan = function() {
    if (!_span) return;
    _span.innerText = _clips.toLocaleString();
  };

  wireSupplier.addLengthUpdatedCallback(function() {
    if (!_button) return;
    _button.disabled = !wireSupplier.canUse(WirePerClip);
  });

  var make = function(amount) {
    if (!amount || amount < 0 || amount !== Math.floor(amount)) {
      console.assert("Invalid amount to make: " + amount);
      return false;
    }

    var amount = Math.min(Math.floor(wireSupplier.getLength() / WirePerClip), amount);
    if (!amount) return false;

    if (!wireSupplier.use(WirePerClip * amount)) {
      console.warn("Insufficient wire to make a new clip.");
      return false;
    }

    _clips += amount;
    syncClipsSpan();
    _clipsUpdatedCallbacks.forEach(function(callback) {
      setTimeout(function() { callback(_clips); }, 0);
    });
    return true;
  };

  return {
    getClips: function() {
      return _clips;
    },
    make: make,
    bind: function(save, clipsSpanId, makeClipButton, clipsPerSecondSpanId) {
      if (save) _clipsUpdatedCallbacks.push(save);

      const DefaultClipsSpanId = "clipsSpan";
      const DefaultMakeClipButtonId = "makeClipButton";
      const DefaultClipsPerSecondSpanId = "clipsPerSecondSpan";

      _span = document.getElementById(clipsSpanId || DefaultClipsSpanId);
      _button = document.getElementById(makeClipButton || DefaultMakeClipButtonId);
      var cpsSpan = document.getElementById(clipsPerSecondSpanId || DefaultClipsPerSecondSpanId);

      syncClipsSpan();

      _button.onclick = function() {
        return make(1);
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
      return {
        clips: _clips
      };
    }
  };
};
