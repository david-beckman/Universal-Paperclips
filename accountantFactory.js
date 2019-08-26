var accountantFactory = function(initial) {
  // Money in cents - stay away from decimals (floats)
  const InitialCents = 0;

  var _cents = (initial && initial.cents) || InitialCents;
  var _centsUpdatedCallbacks = new Array();

  var _span;

  var getDollarsLocaleString = function() {
    return (_cents / CentsPerDollar).toUSDString();
  };

  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = getDollarsLocaleString();
  };

  var getCents = function(dollars) {
    return dollars && dollars * CentsPerDollar;
  };

  var isValidCents = function(cents, source) {
    return Number.isPositiveInteger(cents, "Amount in cents is invalid for a " + source + ": ");
  };

  var canDebitCents = function(cents) {
    if (!isValidCents(cents, "credit")) return false;

    return cents <= _cents;
  };

  var debitCents = function(cents) {
    if (!isValidCents(cents, "credit")) return false;

    if (cents > _cents) {
      console.warn("Insufficient funds (" + getDollarsLocaleString() + ") to debit " + (cents / CentsPerDollar).toUSDString());
      return false;
    }

    _cents -= cents;
    syncSpan();
    _centsUpdatedCallbacks.forEachCallback(_cents, true); // In the wire-buyer loop
    return true;
  };

  var creditCents = function(cents) {
    if (!isValidCents(cents, "credit")) return false;

    _cents += cents;
    syncSpan();
    _centsUpdatedCallbacks.forEachCallback(_cents);

    return true;
  };

  return {
    getCents: function() {
      return _cents;
    },
    bind: function() {
      const DefaultAvailableDollarsSpanId = "availableDollarsSpan";
      _span = document.getElementById(DefaultAvailableDollarsSpanId);
      syncSpan();
    },
    creditCents: creditCents,
    creditDollars: function(dollars) {
      var cents = getCents(dollars);
      return this.creditCents(cents);
    },
    canDebitCents: canDebitCents,
    canDebitDollars: function(dollars) {
      var cents = getCents(dollars);
      return canDebitCents(cents);
    },
    debitCents: debitCents,
    debitDollars: function(dollars) {
      var cents = getCents(dollars);
      return debitCents(cents);
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
