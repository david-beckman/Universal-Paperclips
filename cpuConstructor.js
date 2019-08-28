var cpuConstructor = function(trustWarehouse, initial) {
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

  var _processorsUpdatedCallbacks = [];
  var _memoryUpdatedCallbacks = [];

  var _processorButton;
  var _processorsSpan;
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
    if (_processorsSpan) _processorsSpan.innerText = _processors.toLocaleString();
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
      _processorsUpdatedCallbacks.forEachCallback(_processors);
      _memoryUpdatedCallbacks.forEachCallback(MemoryFactor * _memory);
    },
    bind: function(subgroupDiv) {
      if (!subgroupDiv) return;

      var processorsDiv = subgroupDiv.appendElement("div");
      _processorButton = processorsDiv.appendElement("input", undefined, {
        type: "button",
        id: "processorsButton",
        className: "cpu-button",
        value: "Processors",
        onclick: function() {
          if (!enabled()) {
            console.warn("Insufficient trust to increment processors.");
            return false;
          }
  
          _processors++;
          syncAll();
          _processorsUpdatedCallbacks.forEachCallback(_processors);
        }
      });
      processorsDiv.appendText(" ");
      _processorsSpan = processorsDiv.appendElement("span", undefined, {id: "processorsSpan"});

      var memoryDiv = subgroupDiv.appendElement("div");
      _memoryButton = memoryDiv.appendElement("input", undefined, {
        type: "button",
        id: "memoryButton",
        className: "cpu-button",
        value: "Memory",
        onclick: function() {
          if (!enabled()) {
            console.warn("Insufficient trust to increment memory.");
            return false;
          }
  
          _memory++;
          syncAll();
          _memoryUpdatedCallbacks.forEachCallback(_memory);
        }
      });
      memoryDiv.appendText(" ");
      _memorySpan = memoryDiv.appendElement("span", undefined, {id: "memorySpan"});

      syncAll();
    },
    addMemoryUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _memoryUpdatedCallbacks.push(callback);
    },
    addProcessorsUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _processorsUpdatedCallbacks.push(callback);
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
      _memoryUpdatedCallbacks.forEachCallback(_memory);
      _processorsUpdatedCallbacks.forEachCallback(_processors);
    }
  };
};
