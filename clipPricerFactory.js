var clipPricerFactory = function(initial) {
  const InitialCents = 25;

  var _cents = (initial && initial.cents) || InitialCents;
  var _centsUpdatedCallbacks = new Array();

  return {
    getPriceCents: function() {
      return _cents;
    },
    bind: function(save, decrementClipPriceCentsButtonId, incrementClipPriceCentsButtonId, clipPriceDollarsSpanId) {
      if (save) _centsUpdatedCallbacks.push(save);

      const DefaultDecrementClipPriceCentsButtonId = "decrementClipPriceCentsButton";
      const DefaultIncrementClipPriceCentsButtonId = "incrementClipPriceCentsButton";
      const DefaultClipPriceDollarsSpanId = "clipPriceDollarsSpan";

      var decrementButton = document.getElementById(decrementClipPriceCentsButtonId || DefaultDecrementClipPriceCentsButtonId);
      var incrementButton = document.getElementById(incrementClipPriceCentsButtonId || DefaultIncrementClipPriceCentsButtonId);
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
    addPriceCentsUpdatedCallback: function(callback) {
      if (callback) _centsUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        cents: _cents
      };
    }
  };
};
