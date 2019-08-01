var operationsStorageFactory = function(cpu, initial) {
  if (!cpu || !cpu.getMemory || !cpu.getProcessors || !cpu.addMemoryUpdateCallback) {
    console.assert(false, "No CPU connected to the operations storage.");
    return false;
  }

  const InitialOperations = 0;

  const OperationsInterval = 10;
  const TicksPerSecond = 1000;
  const OpsPerProcPerSec = 10;

  var _operations = (initial && initial.operations) || InitialOperations;
  var _operationsUpdatedCallbacks = new Array();

  var _operationsSpan;
  var _maxSpan;

  var syncOperationsSpan = function() {
    if (!_operationsSpan) return;
    _operationsSpan.innerText = _operations.toLocaleString();
  };

  var syncMaxSpan = function() {
    if (!_maxSpan) return;
    _maxSpan.innerText = cpu.getMemory().toLocaleString();
  };

  var syncSpans = function() {
    syncOperationsSpan();
    syncMaxSpan();
  };

  cpu.addMemoryUpdateCallback(function(memory) {
    syncMaxSpan();
  });

  var isValidAmount = function(amount) {
    if ((amount || amount === 0) && amount >= 0 && amount === Math.floor(amount)) return true;

    console.assert(false, "Amount is invalid: " + amount);
    return false;
  }

  var remainder = 0;
  setInterval(function() {
    if (cpu.getMemory() <= _operations) return;

    var total = cpu.getProcessors() * OpsPerProcPerSec * OperationsInterval + remainder;
    var ops = Math.floor(total / TicksPerSecond);
    remainder = total - (ops * TicksPerSecond);
    _operations += Math.min(ops, cpu.getMemory() - _operations);
    syncOperationsSpan();
    _operationsUpdatedCallbacks.forEach(function(callback) {
      setTimeout(function() { callback(_operations); }, 0);
    });
  }, OperationsInterval);

  return {
    canConsume: function(amount) {
      return isValidAmount(amount) && amount <= _operations;
    },
    consume: function(amount) {
      if (!isValidAmount(amount)) return false;

      if (amount > _operations) {
        console.assert(false, "Insufficient operations (" + _operations.toLocaleString() + ") to consume " + amount.toLocaleString());
        return false;
      }

      _operations -= amount;
      syncOperationsSpan();
      _operationsUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_operations); }, 0);
      });

      return true;
    },
    bind: function(save, subgroupDiv) {
      if (save) _operationsUpdatedCallbacks.push(save);

      if (!subgroupDiv) return;

      var operationsDiv = document.createElement("div");
      operationsDiv.appendChild(document.createTextNode("Operations: "));
      operationsDiv.appendChild(_operationsSpan = document.createElement("span"));
      operationsDiv.appendChild(document.createTextNode(" / "));
      operationsDiv.appendChild(_maxSpan = document.createElement("span"));
      subgroupDiv.appendChild(operationsDiv);

      syncSpans();
    },
    addOperationsUpdatedCallback: function(callback) {
      if (callback) _operationsUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        operations: _operations
      };
    }
  };
};
