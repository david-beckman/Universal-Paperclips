var creativityStorageFactory = function(cpu, operationsStorage, initial) {
  if (!cpu || !cpu.getProcessors) {
    console.assert(false, "No CPU connected to the creativity storage.");
  }

  if (!operationsStorage || !operationsStorage.isAtMax) {
    console.assert(false, "No operations storage connected to the creativity storage.");
  }

  const InitialEnabled = false;
  const InitialCreativity = 0;

  const ProcessorPower = 1.1
  const CreativityInterval = 10;
  const SpeedFactor = 1/4;
  const TicksPerSecond = 1000;

  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _creativity = (initial && initial.creativity) || InitialCreativity;
  var _enabledUpdatedCallbacks = new Array();
  var _creativityUpdatedCallbacks = new Array();

  var _subgroupDiv;
  var _span;

  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = _creativity.toLocaleString();
  };

  var create = function() {
    if (!_subgroupDiv) return;

    var creativityDiv = document.createElement("div");
    creativityDiv.appendChild(document.createTextNode("Creativity: "));
    creativityDiv.appendChild(_span = document.createElement("span"));
    _subgroupDiv.appendChild(creativityDiv);

    syncSpan();
  };

  var isValidAmount = function(amount) {
    if ((amount || amount === 0) && amount >= 0 && amount === Math.floor(amount)) return true;

    console.assert(false, "Amount is invalid: " + amount);
    return false;
  };

  var remainder = 0;
  setInterval(function() {
    if (!_enabled || !operationsStorage.isAtMax()) return;

    var processors = cpu.getProcessors();
    var speed = Math.max(1, Math.log10(processors) * Math.pow(processors, ProcessorPower) + processors - 1);
    var total = remainder + speed * SpeedFactor * CreativityInterval / TicksPerSecond;
    var creativity = Math.floor(total)
    remainder = total - creativity;

    if (creativity >= 1) {
      _creativity += creativity;
      syncSpan();

      _creativityUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_creativity); }, 0);
      });
    }
  }, CreativityInterval);

  return {
    enable: function() {
      _enabled = true;
      create();

      _enabledUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(true); }, 0);
      });
    },
    canConsume: function(amount) {
      return isValidAmount(amount) && amount <= _creativity;
    },
    consume: function(amount) {
      if (!isValidAmount(amount)) return false;

      if (amount > _creativity) {
        console.assert(false, "Insufficient creativity (" + _creativity.toLocaleString() + ") to consume " + amount.toLocaleString());
        return false;
      }

      _creativity -= amount;
      syncSpan();
      _creativityUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_creativity); }, 0);
      });

      return true;
    },
    isEnabled: function() {
      return _enabled;
    },
    bind: function(save, subgroupDiv) {
      if (save) {
        _enabledUpdatedCallbacks.push(save);
        _creativityUpdatedCallbacks.push(save);
      }

      if (!subgroupDiv) return;

      _subgroupDiv = subgroupDiv;

      if (_enabled) create();
    },
    serialize: function() {
      return {
        enabled: _enabled,
        creativity: _creativity
      };
    },
    addCreativityUpdatedCallback: function(callback) {
      if (callback) _creativityUpdatedCallbacks.push(callback);
    },
    addEnabledUpdatedCallback: function(callback) {
      if (callback) _enabledUpdatedCallbacks.push(callback);
    }
  };
};