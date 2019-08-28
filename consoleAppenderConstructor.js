var consoleAppenderConstructor = function(initial) {
  const InitialMessages = ["Welcome to Universal Paperclips"];

  var _pendingMessages = (initial && initial.messages) || InitialMessages;

  var _div;

  var append = function(message) {
    _div.appendElement("div", undefined, {innerText: message});
    _div.scrollTop = _div.scrollHeight;
  };

  return {
    append: function(message) {
      if (!_div) {
        _pendingMessages.push(message);
        return false;
      }

      append(message);

      return true;
    },
    bind: function() {
      const DefaultConsoleDivId = "consoleDiv";
      _div = document.getElementById(DefaultConsoleDivId);
      _pendingMessages.forEach(append);

      return true;
    },
    serialize: function() {
      return {
        messages: (_div && Array.from(_div.childNodes).map(function(child) { return child.innerText; })) || _pendingMessages
      };
    }
  };
};
