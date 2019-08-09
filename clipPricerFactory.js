var clipPricerFactory = function(initial) {
  const InitialCents = 25;

  var _cents = (initial && initial.cents) || InitialCents;
  var _centsUpdatedCallbacks = new Array();

  return {
    getCents: function() {
      return _cents;
    },
    bind: function(save, decrementClipCentsButtonId, incrementClipCentsButtonId, clipPriceDollarsSpanId) {
      if (save) _centsUpdatedCallbacks.push(save);

      const DefaultDecrementClipCentsButtonId = "decrementClipCentsButton";
      const DefaultIncrementClipCentsButtonId = "incrementClipCentsButton";
      const DefaultClipPriceDollarsSpanId = "clipPriceDollarsSpan";

      var decrementButton = document.getElementById(decrementClipCentsButtonId || DefaultDecrementClipCentsButtonId);
      var incrementButton = document.getElementById(incrementClipCentsButtonId || DefaultIncrementClipCentsButtonId);
      var span = document.getElementById(clipPriceDollarsSpanId || DefaultClipPriceDollarsSpanId);

      var syncAll;
      (syncAll = function(includeCallbacks) {
        span.innerText = (_cents / 100).toLocaleString(undefined, {style: "currency", currency: "USD"});
        decrementButton.disabled = _cents <= 1;

        if (includeCallbacks) {
          _centsUpdatedCallbacks.forEach(function(callback) {
            setTimeout(function() { callback(_cents); });
          });
        }
      })(false);

      decrementButton.onclick = function() {
        _cents--;
        syncAll(true);
      };

      incrementButton.onclick = function() {
        _cents++;
        syncAll(true);
      };
    },
    addCentsUpdatedCallback: function(callback) {
      if (callback) _centsUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        cents: _cents
      };
    }
  };
};
