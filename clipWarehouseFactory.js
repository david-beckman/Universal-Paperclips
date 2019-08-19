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

  var _span;
  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = getUnshipped().toLocaleString();
  };

  clipFactory.addClipsUpdatedCallback(function() {
    syncSpan();
  });

  return {
    getUnshipped: getUnshipped,
    bind: function() {
      const DefaultUnshippedClipsSpanId = "unshippedClipsSpan";
      _span = document.getElementById(DefaultUnshippedClipsSpanId);
      syncSpan();
    },
    ship: function(amount) {
      if (!Number.isPositiveInteger(amount, "Clips to ship amount invalid: ")) {
        return false;
      }

      if (amount > getUnshipped()) {
        console.assert(false, "Cannot ship more than are present: " + amount.toLocaleString() + " vs " + getUnshipped().toLocaleString());
        return false;
      }

      _shipped += amount;
      syncSpan();
      _shippedUpdatedCallbacks.forEachCallback(_shipped);

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
