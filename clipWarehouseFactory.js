var clipWarehouseFactory = function(clipFactory, initial) {
  if (!clipFactory || !clipFactory.getClips || !clipFactory.addClipsUpdatedCallback) {
    console.assert(false, "No factory hooked up to the warehouse.");
    return;
  }

  const InitialShipped = 0;

  var _shipped = (initial && initial.shipped) || InitialShipped;
  var _shippedUpdatedCallbacks = new Array();

  var getUnshipped = function() {
    return clipFactory.getClips() - _shipped;
  };

  var getUnshippedLocaleString = function() {
    return getUnshipped().toLocaleString(undefined, {maximumFractionDigits: 0});
  };

  var _span;
  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = getUnshippedLocaleString();
  };

  clipFactory.addClipsUpdatedCallback(function() {
    syncSpan();
  });

  return {
    getUnshipped: getUnshipped,
    bind: function(save, unshippedClipsSpanId) {
      if (save) _shippedUpdatedCallbacks.push(save);

      const DefaultUnshippedClipsSpanId = "unshippedClipsSpan";
      _span = document.getElementById(unshippedClipsSpanId || DefaultUnshippedClipsSpanId);
      syncSpan();
    },
    ship: function(amount) {
      if (!amount || amount !== Math.floor(amount) || amount < 0) {
        console.assert(false, "Cannot ship " + amount + " clips.");
        return false;
      }

      if (amount > getUnshipped()) {
        console.assert(false, "Cannot ship more than are present: " + amount.toLocaleString() + " vs " + getUnshippedLocaleString());
        return false;
      }

      _shipped += amount;
      syncSpan();
      _shippedUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() {  callback(_shipped); });
      });

      return true;
    },
    addUnshippedUpdatedCallback: function(callback) {
      if(!callback) return;

      var wrapper = function() {
        callback(getUnshipped());
      };
      _shippedUpdatedCallbacks.push(wrapper);
      clipFactory.addClipsUpdatedCallback(wrapper);
    },
    serialize: function() {
      return {
        shipped: _shipped
      };
    }
  };
};
