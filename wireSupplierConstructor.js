var wireSupplierConstructor = function(initial) {
  const InitialLength = 1e3;
  const InitialSpoolLength = 1e3;

  var _length = (initial && (initial.length || initial.length === 0)) ? initial.length : InitialLength;
  var _spoolLength = (initial && initial.spoolLength) || InitialSpoolLength;
  var _lengthUpdatedCallbacks = [];

  var _span;
  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = _length.toLocaleString();
  };

  var isValid = function(length) {
    return Number.isPositiveInteger(length, "Invalid length: ");
  };

  return {
    getLength: function() {
      return _length;
    },
    getSpoolLength: function() {
      return _spoolLength;
    },
    increaseSpoolLength: function(percent) {
      if (!Number.isPositiveInteger(percent, "Invalid percent to enhance spool length: ")) {
        return false;
      }

      _spoolLength = Math.floor(_spoolLength * (1 + percent / 100));
      return true;
    },
    addSpool: function() {
      _length += _spoolLength;
      syncSpan();
      _lengthUpdatedCallbacks.forEachCallback(_length);
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
      _lengthUpdatedCallbacks.forEachCallback(_length);

      return true;
    },
    bind: function() {
      const DefaultWireLengthSpanId = "wireLengthSpan";

      _span = document.getElementById(DefaultWireLengthSpanId);
      syncSpan();
    },
    addLengthUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _lengthUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        length: _length,
        spoolLength: _spoolLength
      };
    }
  };
};
