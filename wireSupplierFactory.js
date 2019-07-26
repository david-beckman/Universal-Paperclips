var wireSupplierFactory = function(initial) {
  const InitialLength = 1000;
  const SpoolLength = 1000;

  var _length = (initial && initial.length) || InitialLength;
  var _lengthUpdatedCallbacks = new Array();

  var _span;
  var syncSpan = function(includeCallbacks) {
    if (!_span) return;
    _span.innerText = _length.toLocaleString();
  };

  var isValid = function(length) {
    if (length && length > 0 && length === Math.floor(length)) return true;
    console.assert(false, "Invalid length: " + length);
    return false;
  }

  return {
    addSpool() {
      _length += SpoolLength;
      syncSpan();
      _lengthUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_length); }, 0);
      });
    },
    canUse: function(length) {
      if (!isValid(length)) return false;

      return _length >= length;
    },
    use: function(length) {
      if (!isValid(length)) return false;
      if (_length < length) {
        console.assert(false, "Cannot use " + length.toLocaleString() + " wire when only " + _length.toLocaleString() + " is available.");
        return false;
      }

      _length -= length;
      syncSpan();
      _lengthUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_length); }, 0);
      });

      return true;
    },
    bind: function(save, wireLengthSpanId) {
      if (save) _lengthUpdatedCallbacks.push(save);

      const DefaultWireLengthSpanId = "wireLengthSpan";

      _span = document.getElementById(wireLengthSpanId || DefaultWireLengthSpanId);
      syncSpan();
    },
    addLengthUpdatedCallback: function(callback) {
      if (callback) _lengthUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return { length: _length };
    }
  };
};
