var clipFactoryFactory = function(wireSupplier, initial) {
  if (!wireSupplier || !wireSupplier.getLength ||  !wireSupplier.use || !wireSupplier.canUse || !wireSupplier.addLengthUpdatedCallback) {
    console.assert(false, "No wire supplier hooked to the factory.");
    return false;
  }

  const InitialClips = 0;

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
    _button.disabled = !wireSupplier.canUse(1);
  });

  var make = function(amount) {
    if (!Number.isPositiveInteger(amount, "Invalid amount to make: ")) {
      return 0;
    }

    var amount = Math.min(wireSupplier.getLength(), amount);
    if (!amount) return 0;

    if (!wireSupplier.use(amount)) {
      console.warn("Insufficient wire to make a new clip.");
      return 0;
    }

    _clips += amount;
    syncClipsSpan();
    _clipsUpdatedCallbacks.forEachCallback(_clips);
    return amount;
  };

  return {
    getClips: function() {
      return _clips;
    },
    make: make,
    bind: function() {
      const DefaultClipsSpanId = "clipsSpan";
      const DefaultMakeClipButtonId = "makeClipButton";
      const DefaultClipsPerSecondSpanId = "clipsPerSecondSpan";

      _span = document.getElementById(DefaultClipsSpanId);
      _button = document.getElementById(DefaultMakeClipButtonId);
      var cpsSpan = document.getElementById(DefaultClipsPerSecondSpanId);
      cpsSpan.innerText = 0;

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
