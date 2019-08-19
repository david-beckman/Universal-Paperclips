var clipPricerFactory = function(initial) {
  const InitialCents = 25;

  var _cents = (initial && initial.cents) || InitialCents;
  var _centsUpdatedCallbacks = new Array();

  return {
    getCents: function() {
      return _cents;
    },
    bind: function() {
      const DefaultDecrementClipCentsButtonId = "decrementClipCentsButton";
      const DefaultIncrementClipCentsButtonId = "incrementClipCentsButton";
      const DefaultClipDollarsSpanId = "clipDollarsSpan";

      var decrementButton = document.getElementById(DefaultDecrementClipCentsButtonId);
      var incrementButton = document.getElementById(DefaultIncrementClipCentsButtonId);
      var span = document.getElementById(DefaultClipDollarsSpanId);

      var syncAll;
      (syncAll = function(includeCallbacks) {
        span.innerText = (_cents / CentsPerDollar).toUSDString();
        decrementButton.disabled = _cents <= 1;

        if (includeCallbacks) {
          _centsUpdatedCallbacks.forEachCallback(_cents);
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
