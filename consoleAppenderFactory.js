var consoleAppenderFactory = function(initial) {
  const DefaultConsoleDivId = "consoleDiv";
  const InitialMessages = ["Welcome to Universal Paperclips"];

  var _pendingMessages = (initial && initial.messages) || InitialMessages;

  var _div;
  var _messagesUpdatedCallbacks = new Array();

  var messagesUpdated = function() {
    _messagesUpdatedCallbacks.forEach(function(callback) {
      callback();
    });
  };

  var append = function(message) {
    var child = document.createElement("div");
    child.innerText = message;

    _div.appendChild(child);
    _div.scrollTop = _div.scrollHeight;
  };

  return {
    append: function(message) {
      if (!_div) {
        _pendingMessages.push(message);
        messagesUpdated();
        return false;
      }

      append(message);
      messagesUpdated();

      return true;
    },
    bind: function(save, consoleDivId) {
      if (save) _messagesUpdatedCallbacks.push(save);

      _div = document.getElementById(consoleDivId || DefaultConsoleDivId);
      _pendingMessages.forEach(append);

      return true;
    },
    serialize() {
      return {
        messages: (_div && Array.from(_div.childNodes).map(function(child) { return child.innerText; })) || _pendingMessages
      };
    }
  };
};
