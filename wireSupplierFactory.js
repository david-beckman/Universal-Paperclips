var wireSupplierFactory = function(initial) {
  const InitialLength = 1000;
  const InitialSpoolLength = 1000;

  var _length = (initial && (initial.length || initial.length === 0)) ? initial.length : InitialLength;
  var _spoolLength = (initial && initial.spoolLength) || InitialSpoolLength;
  var _lengthUpdatedCallbacks = new Array();

  var _span;
  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = _length.toLocaleString();
  };

  var isValid = function(length) {
    if (length && length > 0 && length === Math.floor(length)) return true;
    console.assert(false, "Invalid length: " + length);
    return false;
  };

  return {
    getLength: function() {
      return _length;
    },
    getSpoolLength: function() {
      return _spoolLength;
    },
    increaseSpoolLength: function(percent) {
      if (!percent || percent <= 0 || percent > 100 || percent !== Math.floor(percent)) {
        console.assert(false, "Invalid percent to enhance spool length: " + percent);
        return false;
      }

      _spoolLength = Math.floor(_spoolLength * (1 + percent / 100));
      return true;
    },
    addSpool: function() {
      _length += _spoolLength;
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
      return {
        length: _length,
        spoolLength: _spoolLength
      };
    }
  };
};
