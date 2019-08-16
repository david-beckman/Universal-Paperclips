var cpuFactory = function(trustWarehouse, initial) {
  if (!trustWarehouse || !trustWarehouse.getTrust || !trustWarehouse.addTrustUpdatedCallback) {
    console.assert(false, "No trust warehouse connected to the CPU.");
    return;
  }

  const InitialEnabled = false;
  const InitialProcessors = 0;
  const InitialMemory = 0;

  const StartingProcessors = 1;
  const StartingMemory = 1;

  const MemoryFactor = 1e3;

  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _processors = (initial && initial.processors) || InitialProcessors;
  var _memory = (initial && initial.memory) || InitialMemory;

  var _processorsUpdatedCallbacks = new Array();
  var _memoryUpdatedCallbacks = new Array();

  var _processorButton;
  var _processorSpan;
  var _memoryButton;
  var _memorySpan;

  var enabled = function() {
    return trustWarehouse.getTrust() > (_processors + _memory);
  };

  var syncButtonsDisabledFlags = function() {
    var disabled = !enabled();
    if (_processorButton) _processorButton.disabled = disabled;
    if (_memoryButton) _memoryButton.disabled = disabled;
  };

  var syncAll = function() {
    if (_processorSpan) _processorSpan.innerText = _processors.toLocaleString();
    if (_memorySpan) _memorySpan.innerText = _memory.toLocaleString();
    syncButtonsDisabledFlags();
  };

  trustWarehouse.addTrustUpdatedCallback(function() {
    syncButtonsDisabledFlags();
  });

  return {
    getProcessors: function() {
      return _processors;
    },
    getMemory: function() {
      return MemoryFactor * _memory;
    },
    isEnabled: function() {
      return _enabled;
    },
    enable: function() {
      _enabled = true;
      _processors = StartingProcessors;
      _memory = StartingMemory;

      syncAll();
      _processorsUpdatedCallbacks.forEach(function(callback) {
        callback(_processors);
      });
      _memoryUpdatedCallbacks.forEach(function(callback) {
        callback(MemoryFactor * _memory);
      });
    },
    bind: function(save, subgroupDiv) {
      if (save) {
        _processorsUpdatedCallbacks.push(save);
        _memoryUpdatedCallbacks.push(save);
      }

      if (!subgroupDiv) return;

      var processorsDiv = document.createElement("div");
      _processorButton = document.createElement("input");
      _processorButton.type = "button";
      _processorButton.className = "cpu-button";
      _processorButton.value = "Processors";
      _processorButton.onclick = function() {
        if (!enabled()) {
          console.warn("Insufficient trust to increment processors.");
          return false;
        }

        _processors++;
        syncAll();
        _processorsUpdatedCallbacks.forEach(function(callback) {
          callback(_processors);
        });
      };
      processorsDiv.appendChild(_processorButton);
      processorsDiv.appendChild(document.createTextNode(" "));
      processorsDiv.appendChild(_processorSpan = document.createElement("span"));
      subgroupDiv.appendChild(processorsDiv);

      var memoryDiv = document.createElement("div");
      _memoryButton = document.createElement("input");
      _memoryButton.type = "button";
      _memoryButton.className = "cpu-button";
      _memoryButton.value = "Memory";
      _memoryButton.onclick = function() {
        if (!enabled()) {
          console.warn("Insufficient trust to increment memory.");
          return false;
        }

        _memory++;
        syncAll();
        _memoryUpdatedCallbacks.forEach(function(callback) {
          callback(_memory);
        });
      };
      memoryDiv.appendChild(_memoryButton);
      memoryDiv.appendChild(document.createTextNode(" "));
      memoryDiv.appendChild(_memorySpan = document.createElement("span"));
      subgroupDiv.appendChild(memoryDiv);

      syncAll();
    },
    addMemoryUpdatedCallback: function(callback) {
      if (callback) _memoryUpdatedCallbacks.push(callback);
    },
    addProcessorsUpdatedCallback: function(callback) {
      if (callback) _processorsUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        enabled: _enabled,
        processors: _processors,
        memory: _memory
      };
    },
    clear: function() {
      _processors = 0;
      _memory = 0;

      syncAll();
      _memoryUpdatedCallbacks.forEach(function(callback) {
        callback(_memory);
      });
      _processorsUpdatedCallbacks.forEach(function(callback) {
        callback(_processors);
      });
    }
  };
};
