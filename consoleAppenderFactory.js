var consoleAppenderFactory = function() {
  DefaultConsoleDivId = "consoleDiv";

  var _pendingMessages = ["Welcome to Universal Paperclips"];

  var _div;
  var append = function(message) {
    if (!_div) {
      _pendingMessages.push(message);
      return false;
    }

    var child = document.createElement("div");
    child.innerText = message;

    _div.appendChild(child);
    _div.scrollTop = _div.scrollHeight;

    return true;
  };

  return {
    append: append,
    bind: function(consoleDivId) {
      if (_div) {
        console.assert(false, "The console appender is already bound - cannot bind again.");
        return false;
      }

      _div = document.getElementById(consoleDivId || DefaultConsoleDivId);
      _pendingMessages.forEach(append);

      return true;
    }
  };
}
