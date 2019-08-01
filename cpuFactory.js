var cpuFactory = function(consoleAppender, trustWarehouse, initial) {
  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the CPU.");
    return;
  }

  if (!trustWarehouse || !trustWarehouse.getLevel || !trustWarehouse.addLevelUpdatedCallback) {
    console.assert(false, "No trust warehouse connected to the CPU.");
    return;
  }

  const InitialProcessors = 0;
  const InitialMemory = 0;

  const StartingProcessors = 1;
  const StartingMemory = 1;

  const MemoryFactor = 1000;

  var _processors = (initial && initial.processors) || InitialProcessors;
  var _memory = (initial && initial.memory) || InitialMemory;

  var _processorsUpdatedCallbacks = new Array();
  var _memoryUpdatedCallbacks = new Array();

  var _processorButton;
  var _processorSpan;
  var _memoryButton;
  var _memorySpan;

  var enabled = function() {
    return trustWarehouse.getLevel() > (_processors + _memory);
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

  trustWarehouse.addLevelUpdatedCallback(function() {
    syncButtonsDisabledFlags();
  });

  return {
    getProcessors: function() {
      return _processors;
    },
    getMemory: function() {
      return MemoryFactor * _memory;
    },
    enable: function() {
      _processors = StartingProcessors;
      _memory = StartingMemory;

      syncAll();
      _processorsUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(_processors); }, 0);
      });
      _memoryUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(MemoryFactor * _memory); }, 0);
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
        consoleAppender.append("Processor added, operations (or creativity) per sec increased");
        syncAll();
        _processorsUpdatedCallbacks.forEach(function(callback) {
          setTimeout(function() { callback(_processors); }, 0);
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
        consoleAppender.append("Memory added, max operations increased");
        syncAll();
        _memoryUpdatedCallbacks.forEach(function(callback) {
          setTimeout(function() { callback(_memory); }, 0);
        });
      };
      memoryDiv.appendChild(_memoryButton);
      memoryDiv.appendChild(document.createTextNode(" "));
      memoryDiv.appendChild(_memorySpan = document.createElement("span"));
      subgroupDiv.appendChild(memoryDiv);

      syncAll();
    },
    addMemoryUpdateCallback: function(callback) {
      if (callback) _memoryUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        processors: _processors,
        memory: _memory
      };
    }
  };
};
