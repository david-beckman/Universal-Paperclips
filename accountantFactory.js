var accountantFactory = function(initial) {
  // Money in cents - stay away from decimals (floats)
  const InitialCents = 0;

  var _cents = (initial && initial.cents) || InitialCents;
  var _centsAdjustedCallbacks = new Array();

  var _span;

  var getDollarsLocaleString = function() {
    return (_cents / 100).toLocaleString(undefined, {style: "currency", currency: "USD"});
  }

  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = getDollarsLocaleString();
  }

  var isValid = function(cents, source) {
    if ((cents || cents === 0) && cents >= 0) return true;

    console.assert(false, "Amount in cents is invalid for a " + source + ": " + cents);
    return false;
  }

  return {
    bind: function(save, availableDollarsSpanId) {
      if (save) _centsAdjustedCallbacks.push(save);

      const DefaultAvailableDollarsSpanId = "availableDollarsSpan";
      _span = document.getElementById(availableDollarsSpanId || DefaultAvailableDollarsSpanId);
      syncSpan();
    },
    creditCents: function(cents) {
      if (!isValid(cents, "credit")) return false;

      _cents += cents;
      syncSpan();
      _centsAdjustedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_cents); }, 0);
      });

      return true;
    },
    serialize: function() {
      return {
        cents: _cents
      };
    }
  };
};
