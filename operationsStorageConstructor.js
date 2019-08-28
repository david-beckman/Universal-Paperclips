var operationsStorageConstructor = function(cpu, initial) {
  if (!cpu || !cpu.getMemory || !cpu.getProcessors || !cpu.addMemoryUpdatedCallback) {
    console.assert(false, "No CPU connected to the operations storage.");
    return false;
  }

  const InitialBuffer = 0;
  const InitialFadeTimespan = 0;
  const InitialOperations = 0;

  const DamperMinimum = 5;
  const DamperFactor = 1 / 100;
  const FadeFactor = Math.pow(3, 3.5) / 1e3; // 0.046765...
  const FadeMinimum = 0.01;
  const FadeTimeout = 8e3; // 8s
  const OperationsInterval = 10;
  const OpsPerProcPerSec = 10;

  var _buffer = (initial && initial.buffer) || InitialBuffer;
  var _fadeTime = new Date().getTime() + (initial && initial.fadeTimespan) || InitialFadeTimespan
  var _operations = (initial && initial.operations) || InitialOperations;
  var _operationsUpdatedCallbacks = [];

  var _operationsSpan;
  var _maxSpan;

  var getTotalOps = function() {
    return _operations + _buffer;
  };

  var syncOperationsSpan = function() {
    if (!_operationsSpan) return;
    _operationsSpan.innerText = getTotalOps().toLocaleString();
  };

  var syncMaxSpan = function() {
    if (!_maxSpan) return;
    _maxSpan.innerText = cpu.getMemory().toLocaleString();
  };

  var syncSpans = function() {
    syncOperationsSpan();
    syncMaxSpan();
  };

  cpu.addMemoryUpdatedCallback(function(memory) {
    syncMaxSpan();
  });

  var isValidAmount = function(amount) {
    return Number.isPositiveInteger(amount, "Operations amount is invalid: ");
  };

  var isAtMax = function() {
    return cpu.getMemory() <= _operations;
  };

  var rebalance = function() {
    var total = getTotalOps();
    _operations = Math.min(cpu.getMemory(), total);
    _buffer = total - _operations;
  };

  var remainder = 0;
  setInterval(function() {
    rebalance();
    var updated = false;
    var overage;

    if (_buffer > 0 && (overage = (new Date().getTime() - _fadeTime)) > 0) {
      _buffer -= Math.min(_buffer, Math.round(FadeMinimum + overage * FadeFactor / OperationsInterval));
      updated = true;
    }

    if (!isAtMax()) {
      var total = cpu.getProcessors() * OpsPerProcPerSec * OperationsInterval + remainder;
      var ops = Math.floor(total / TicksPerSecond);
      remainder = total - (ops * TicksPerSecond);
      _operations += Math.min(ops, cpu.getMemory() - _operations);
      updated = true;
    }

    if (updated) {
      syncOperationsSpan();
      _operationsUpdatedCallbacks.forEachCallback(getTotalOps());
    }
  }, OperationsInterval);

  return {
    addTempOperations: function(ops) {
      if (!Number.isInteger(ops)) {
        console.assert(false, "Invalid operations to add: " + ops);
        return false;
      }

      if (ops === 0) return true;
      else if (ops < 0) {
        _buffer += ops;
        rebalance();
      } else {
        _operations += ops;
        var overage = _operations - cpu.getMemory();
        if (overage > 0) {
          _operations -= overage;
          var damper = _buffer * DamperFactor + DamperMinimum;
          _buffer += Math.ceil(overage / damper);
          _fadeTime = new Date().getTime() + FadeTimeout;
        }
      }

      syncOperationsSpan();
      _operationsUpdatedCallbacks.forEachCallback(getTotalOps());

      return true;
    },
    isAtMax: isAtMax,
    canConsume: function(amount) {
      return isValidAmount(amount) && amount <= getTotalOps();
    },
    consume: function(amount) {
      if (!isValidAmount(amount)) return false;

      var total = getTotalOps();
      if (amount > total) {
        console.assert(false, "Insufficient operations (" + total.toLocaleString() + ") to consume " + amount.toLocaleString());
        return false;
      }

      _buffer -= amount;
      rebalance();
      syncOperationsSpan();
      _operationsUpdatedCallbacks.forEachCallback(getTotalOps());

      return true;
    },
    bind: function(subgroupDiv) {
      if (!subgroupDiv) return;

      var operationsDiv = subgroupDiv.appendElement("div", undefined, {innerText: "Operations: "});
      _operationsSpan = operationsDiv.appendElement("span");
      operationsDiv.appendText(" / ");
      _maxSpan = operationsDiv.appendElement("span");

      syncSpans();
    },
    addOperationsUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _operationsUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        buffer: _buffer,
        fadeTimespan: Math.max(0, _fadeTime - new Date().getTime()),
        operations: _operations
      };
    }
  };
};
