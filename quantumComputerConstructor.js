var quantumComputerConstructor = function(operationsStorage, initial) {
  if (!operationsStorage || !operationsStorage.addTempOperations) {
    console.assert(false, "No operations storage connected to the quantum computer.");
    return;
  }

  const InitialChips = [];
  const InitialEnabled = false;

  const ChipCostIncrement = 5e3;
  const ComputeFactor = 360;
  const CounterFactor = 1/1e3;
  const FadeTimeout = 100;
  const InitialChipCost = 10e3;
  const MaxChips = 10;
  const UpdateInterval = 10;

  var _chips = (initial && initial.chips) || InitialChips;
  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _enabledUpdatedCallbacks = [];

  var _chipRowDiv;
  var _groupdiv;

  var create = function() {
    if (!_groupDiv) return;

    var subGroupDiv = _groupDiv.appendElement("div", undefined, {className: "sub-group outlined"});
    subGroupDiv.appendElement("h3", undefined, {innerText: "Quantum Computing"});

    _chipRowDiv = subGroupDiv.appendElement("div", undefined, {id: "qChipsDiv"});

    for (var i=0; i<_chips.length; i++) {
      var chip = _chipRowDiv.appendElement("div", undefined, {className: "chip"});
      chip.style.opacity = Math.max(0, _chips[i]);
    }

    var buttonRow = subGroupDiv.appendElement("div");

    buttonRow.appendElement("input", undefined, {
      type: "button",
      id: "computeQuantumButton",
      value: "Compute",
      onclick: function() {
        if (buttonRow.lastChild.classList && buttonRow.lastChild.classList.contains("fadable")) buttonRow.removeChild(buttonRow.lastChild);
        var span = buttonRow.appendElement("span", undefined, {className: "fadable"});
        setTimeout(function() { span.classList.add("fade-out"); }, FadeTimeout);

        if (_chips.length === InitialChips.length) {
          span.innerText = "Need Photonic Chips";
          return;
        }

        var value = Math.ceil(_chips.reduce(function(a, b) { return a + b;}) * ComputeFactor);
        span.innerText = "Operations: " + value.toLocaleString();
        operationsStorage.addTempOperations(value);
      }
    });

    buttonRow.appendText(" ");
  };

  setInterval(function() {
    var counter = Math.round(new Date().getTime() / UpdateInterval);
    for (var i=0; i<_chips.length; i++) {
      _chips[i] = Math.sin(counter * (i + 1) * CounterFactor);
      _chipRowDiv.children[i].style.opacity = Math.max(0, _chips[i]);
    }
  }, UpdateInterval);

  return {
    addChip: function() {
      if (_chips.length >= MaxChips) {
        console.assert(false, "Cannot add chips beyond the max: " + MaxChips);
        return false;
      }

      _chips[_chips.length] = 0;
      
      if (!_chipRowDiv) return;
      _chipRowDiv.appendElement("div", undefined, {className: "chip"});
    },
    addEnabledUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _enabledUpdatedCallbacks.push(callback);
    },
    bind: function(groupDiv) {
      if (!groupDiv) return;
      _groupDiv = groupDiv;

      if (_enabled) create();
    },
    enable: function() {
      _enabled = true;
      _enabledUpdatedCallbacks.forEachCallback(true);

      create();
    },
    getChips: function() {
      return _chips.length;
    },
    getChipCost: function() {
      return InitialChipCost + _chips.length * ChipCostIncrement;
    },
    getMaxChips: function() {
      return MaxChips;
    },
    isEnabled: function() {
      return _enabled;
    },
    serialize: function() {
      return {
        chips: _chips,
        enabled: _enabled
      };
    }
  };
};
