var computerConstructor = function(consoleAppender, cpu, creativityStorage, milestoneTracker, operationsStorage, projectTracker,
    quantumComputer, trustWarehouse, _) {
  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the computer.");
    return;
  }

  if (!cpu || !cpu.bind || !cpu.enable || !cpu.isEnabled || !cpu.addMemoryUpdatedCallback || !cpu.addProcessorsUpdatedCallback) {
    console.assert(false, "No CPU connected to the computer.");
    return;
  }

  if (!creativityStorage || !creativityStorage.bind || !creativityStorage.isEnabled) {
    console.assert(false, "No creativity storage connected to the computer.");
    return;
  }

  if (!milestoneTracker || !milestoneTracker.getFibonacciClipTarget || !milestoneTracker.addFibonacciLevelUpdatedCallback ||
      !milestoneTracker.incrementFibonacciLevel) {
    console.assert(false, "No milestone tracker connected to the computer.");
    return;
  }

  if (!operationsStorage || !operationsStorage.bind) {
    console.assert(false, "No operations storage connected to the computer.");
    return;
  }

  if (!projectTracker || !projectTracker.bind || !projectTracker.addProjectVisibilityUpdatedCallback) {
    console.assert(false, "No project tracker connected to the computer.");
    return;
  }

  if (!quantumComputer || !quantumComputer.bind) {
    console.assert(false, "No quantum module connected to the computer.");
    return;
  }

  if (!trustWarehouse || !trustWarehouse.bind || !trustWarehouse.increaseTrust || !trustWarehouse.useTrust) {
    console.assert(false, "No trust warehouse connected to the computer.");
    return;
  }

  var _div;
  var _productionSpan;

  var syncSpan = function() {
    if (!_productionSpan) return;
    _productionSpan.innerText = milestoneTracker.getFibonacciClipTarget().toLocaleString();
  };

  var create = function() {
    if (!_div) return;

    var group = _div.appendElement("div", undefined, {className: "group"});
    group.appendElement("h2", undefined, {innerText: "Computation Resources"});

    var trustDiv = group.appendElement("div", undefined, {className: "sub-group"});
    trustWarehouse.bind(trustDiv);

    var productionGoalDiv = trustDiv.appendElement("div", undefined, {innerText: "+1 Trust at: "});
    _productionSpan = productionGoalDiv.appendElement("span");
    productionGoalDiv.appendText(" clips");

    var cpuDiv = group.appendElement("div", undefined, {className: "sub-group"});
    cpu.bind(cpuDiv);

    var operationsDiv = group.appendElement("div", undefined, {className: "sub-group"});
    operationsStorage.bind(operationsDiv);
    creativityStorage.bind(operationsDiv);

    quantumComputer.bind(group);

    projectTracker.bind(_div);

    syncSpan();
  };

  // TODO: This is a bit of a hack - not sure what it should look like...
  var enabling = false;
  milestoneTracker.addFibonacciLevelUpdatedCallback(function() {
    if (!cpu.isEnabled()) {
      consoleAppender.append("Trust-Constrained Self-Modification enabled");
      enabling = true; // prevent the processor / memory added comments
      cpu.enable();
      create();
    } else {
      if (trustWarehouse.getTrust() < 50) {
        consoleAppender.append("Production target met: TRUST INCREASED, additional processor/memory capacity granted");
      }
      trustWarehouse.increaseTrust(1);
    }

    syncSpan();
  });

  projectTracker.addProjectVisibilityUpdatedCallback(function() {
    if (cpu.isEnabled()) return;
    milestoneTracker.incrementFibonacciLevel();
    // This will push to the other event triggering the enabling of the CPU.
  });

  cpu.addProcessorsUpdatedCallback(function(processors) {
    if (processors <= 0) return;

    if (enabling) {
      setTimeout(function() {enabling = false;}, 0);
      return;
    }

    if (processors < 25) {
      consoleAppender.append(creativityStorage.isEnabled() ?
        "Processor added, operations (or creativity) per sec increased" :
        "Processor added, operations per sec increased");
    }
  });

  cpu.addMemoryUpdatedCallback(function(memory) {
    if (memory <= 0) return;

    if (enabling) {
      setTimeout(function() {enabling = false;}, 0);
      return;
    }

    if (memory < 25) {
      consoleAppender.append("Memory added, max operations increased");
    }
  });

  return {
    bind: function() {
      const DefaultSecondColumnDivId = "secondColumnDiv";
      _div = document.getElementById(DefaultSecondColumnDivId);

      if (cpu.isEnabled()) create();
    },
    serialize: function() {}
  };
};
