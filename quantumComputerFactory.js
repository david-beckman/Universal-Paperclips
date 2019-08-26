var quantumComputerFactory = function(operationsStorage, initial) {
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
  var _enabledUpdatedCallbacks = new Array();

  var _chipDivs;
  var _groupdiv;

  var create = function() {
    if (!_groupDiv) return;

    var subGroupDiv = document.createElement("div");
    subGroupDiv.classList.add("outlined");
    subGroupDiv.classList.add("sub-group");
    _groupDiv.appendChild(subGroupDiv);

    var title = document.createElement("h3");
    title.innerText = "Quantum Computing";
    subGroupDiv.appendChild(title);

    var chipRow = document.createElement("div");
    subGroupDiv.appendChild(chipRow);

    _chipDivs = new Array();
    for (var i=0; i<MaxChips; i++) {
      var chip = _chipDivs[i] = document.createElement("div");
      chip.className = "chip";
      chip.style.opacity = _chips.length > i ? Math.max(0, _chips[i]) : 0;
      chipRow.appendChild(chip);
    }

    var buttonRow = document.createElement("div");
    subGroupDiv.appendChild(buttonRow);

    var button = document.createElement("input");
    button.type = "button";
    button.id = "computeQuantumButton";
    button.value = "Compute";
    buttonRow.appendChild(button);

    buttonRow.appendText(" ");

    button.onclick = function() {
      if (buttonRow.lastChild.classList && buttonRow.lastChild.classList.contains("fadable")) buttonRow.removeChild(buttonRow.lastChild);
      var span = document.createElement("span");
      span.classList.add("fadable");
      setTimeout(function() { span.classList.add("fade-out"); }, FadeTimeout);
      buttonRow.appendChild(span);

      if (_chips.length === InitialChips.length) {
        span.innerText = "Need Photonic Chips";
        return;
      }

      var value = Math.ceil(_chips.reduce(function(a, b) { return a + b;}) * ComputeFactor);
      span.innerText = "Operations: " + value.toLocaleString();
      operationsStorage.addTempOperations(value);
    };
  };

  setInterval(function() {
    var counter = Math.round(new Date().getTime() / UpdateInterval);
    for (var i=0; i<_chips.length; i++) {
      _chips[i] = Math.sin(counter * (i + 1) * CounterFactor);
      _chipDivs[i].style.opacity = Math.max(0, _chips[i]);
    }
  }, UpdateInterval);

  return {
    addChip: function() {
      if (_chips >= MaxChips) {
        console.assert(false, "Cannot add chips beyond the max: " + MaxChips);
        return false;
      }

      _chips[_chips.length] = 0;
    },
    addEnabledUpdatedCallback: function(callback) {
      if (callback) _enabledUpdatedCallbacks.push(callback);
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
