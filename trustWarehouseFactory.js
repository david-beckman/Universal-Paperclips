var trustWarehouseFactory = function(initial) {
  const InitialBribes = 0;
  const InitialTrust = 2;

  var _bribes = (initial && initial.bribes) || InitialBribes;
  var _bribesUpdatedCallbacks = [];
  var _trust = (initial && initial.trust) || InitialTrust;
  var _trustUpdatedCallbacks = [];

  var _span;

  var syncSpan = function() {
    if (_span) _span.innerText = _trust.toLocaleString();
  };

  var isValid = function(amount) {
    return Number.isPositiveInteger(amount, "Trust amount is invalid: ");
  };

  return {
    addBribesUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _bribesUpdatedCallbacks.push(callback);
    },
    addTrustUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _trustUpdatedCallbacks.push(callback);
    },
    bind: function(subgroupDiv) {
      if (!subgroupDiv) return;

      var trustDiv = document.createElement("div");
      trustDiv.appendText("Trust: ");
      trustDiv.appendChild(_span = document.createElement("span"));
      subgroupDiv.appendChild(trustDiv);

      syncSpan();
    },
    bribe: function() {
      _bribes++;
      _trust++;

      syncSpan();

      _bribesUpdatedCallbacks.forEachCallback(_bribes);
      _trustUpdatedCallbacks.forEachCallback(_trust);
    },
    getBribes: function() {
      return _bribes;
    },
    getBribeDollars: function() {
      return 500e3 * Math.pow(2, _bribes);
    },
    getTrust: function() {
      return _trust;
    },
    increaseTrust: function(amount) {
      if (!isValid(amount)) return false;

      _trust += amount;
      _trustUpdatedCallbacks.forEachCallback(_trust);
      syncSpan();

      return true;
    },
    serialize: function() {
      return {
        bribes: _bribes,
        trust: _trust
      };
    },
    useTrust: function(amount) {
      if (!isValid(amount)) return false;

      _trust -= amount;
      _trustUpdatedCallbacks.forEachCallback(_trust);
      syncSpan();

      return true;
    }
  };
};
