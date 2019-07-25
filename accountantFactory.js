var accountantFactory = function(initial) {
  // Money in cents - stay away from decimals (floats)
  const InitialCents = 0;

  var _cents = (initial && initial.cents) || InitialCents;
  var _centsUpdatedCallbacks = new Array();

  var _span;

  var getDollarsLocaleString = function() {
    return (_cents / 100).toLocaleString(undefined, {style: "currency", currency: "USD"});
  }

  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = getDollarsLocaleString();
  }

  var getCents = function(dollars) {
    return dollars && dollars * 100;
  }

  var isValidCents = function(cents, source) {
    if ((cents || cents === 0) && cents >= 0 && cents === Math.floor(cents)) return true;

    console.assert(false, "Amount in cents is invalid for a " + source + ": " + cents);
    return false;
  }

  return {
    bind: function(save, availableDollarsSpanId) {
      if (save) _centsUpdatedCallbacks.push(save);

      const DefaultAvailableDollarsSpanId = "availableDollarsSpan";
      _span = document.getElementById(availableDollarsSpanId || DefaultAvailableDollarsSpanId);
      syncSpan();
    },
    creditCents: function(cents) {
      if (!isValidCents(cents, "credit")) return false;

      _cents += cents;
      syncSpan();
      _centsUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_cents); }, 0);
      });

      return true;
    },
    canDebitDollars: function(dollars) {
      var cents = getCents(dollars);
      if (!isValidCents(cents, "credit")) return false;

      return cents <= _cents;
    },
    debitDollars: function(dollars) {
      var cents = getCents(dollars);
      if (!isValidCents(cents, "credit")) return false;

      if (cents > _cents) {
        console.warn("Insufficient funds (" + getDollarsLocaleString() + ") to debit " + dollars.toLocaleString(undefined, {style: "currency", currency: "USD"}));
        return false;
      }

      _cents -= cents;
      syncSpan();
      _centsUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_cents); }, 0);
      });
      return true;
    },
    serialize: function() {
      return {
        cents: _cents
      };
    },
    addCentsUpdatedCallback: function(callback) {
      if (callback) _centsUpdatedCallbacks.push(callback);
    }
  };
};
