var trustWarehouseFactory = function(initial) {
  const InitialTrust = 2;

  var _trust = (initial && initial.trust) || InitialTrust;
  var _trustUpdatedCallbacks = new Array();

  var _span;

  var syncSpan = function() {
    if (_span) _span.innerText = _trust.toLocaleString();
  };

  var isValid = function(amount) {
    return Number.isPositiveInteger(amount, "Trust amount is invalid: ");
  };

  return {
    getTrust() {
      return _trust;
    },
    increaseTrust(amount) {
      if (!isValid(amount)) return false;

      _trust += amount;
      _trustUpdatedCallbacks.forEachCallback(_trust);
      syncSpan();

      return true;
    },
    useTrust(amount) {
      if (!isValid(amount)) return false;

      _trust -= amount;
      _trustUpdatedCallbacks.forEachCallback(_trust);
      syncSpan();

      return true;
    },
    bind: function(subgroupDiv) {
      if (!subgroupDiv) return;

      var trustDiv = document.createElement("div");
      trustDiv.appendChild(document.createTextNode("Trust: "));
      trustDiv.appendChild(_span = document.createElement("span"));
      subgroupDiv.appendChild(trustDiv);

      syncSpan();
    },
    serialize: function() {
      return {
        trust: _trust
      };
    },
    addTrustUpdatedCallback: function(callback) {
      if (callback) _trustUpdatedCallbacks.push(callback);
    }
  };
};
