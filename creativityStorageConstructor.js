var creativityStorageConstructor = function(cpu, operationsStorage, initial) {
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

  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _creativity = (initial && initial.creativity) || InitialCreativity;
  var _enabledUpdatedCallbacks = [];
  var _creativityUpdatedCallbacks = [];

  var _subgroupDiv;
  var _span;

  var syncSpan = function() {
    if (!_span) return;
    _span.innerText = _creativity.toLocaleString();
  };

  var create = function() {
    if (!_subgroupDiv) return;

    _span = _subgroupDiv
      .appendElement("div", undefined, {innerText: "Creativity: "})
      .appendElement("span");

    syncSpan();
  };

  var isValidAmount = function(amount) {
    return Number.isPositiveInteger(amount, "Creativity amount is invalid: ");
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

      _creativityUpdatedCallbacks.forEachCallback(_creativity);
    }
  }, CreativityInterval);

  return {
    enable: function() {
      _enabled = true;
      create();

      _enabledUpdatedCallbacks.forEachCallback(true);
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
      _creativityUpdatedCallbacks.forEachCallback(_creativity);

      return true;
    },
    isEnabled: function() {
      return _enabled;
    },
    bind: function(subgroupDiv) {
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
      if (typeof(callback) === "function") _creativityUpdatedCallbacks.push(callback);
    },
    addEnabledUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _enabledUpdatedCallbacks.push(callback);
    }
  };
};