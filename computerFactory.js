var computerFactory = function(consoleAppender, cpu, creativityStorage, milestoneTracker, operationsStorage, projectTracker, trustWarehouse, _) {
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

  if (!milestoneTracker || !milestoneTracker.getFibonacciClipTarget || !milestoneTracker.addFibonacciLevelUpdatedCallback || !milestoneTracker.incrementFibonacciLevel) {
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

    var group = document.createElement("div");
    group.className = "group";
    _div.appendChild(group);

    var title = document.createElement("h2");
    title.innerText = "Computation Resources";
    group.appendChild(title);

    var trustDiv = document.createElement("div");
    trustDiv.className = "sub-group";
    group.appendChild(trustDiv);

    trustWarehouse.bind(undefined, trustDiv);

    var productionGoalDiv = document.createElement("div");
    productionGoalDiv.appendChild(document.createTextNode("+1 Trust at: "));
    productionGoalDiv.appendChild(_productionSpan = document.createElement("span"));
    productionGoalDiv.appendChild(document.createTextNode(" clips"));
    trustDiv.appendChild(productionGoalDiv);

    var cpuDiv = document.createElement("div");
    cpuDiv.className = "sub-group";
    cpu.bind(undefined, cpuDiv);
    group.appendChild(cpuDiv);

    var operationsDiv = document.createElement("div");
    operationsDiv.className = "sub-group";
    operationsStorage.bind(undefined, operationsDiv);
    creativityStorage.bind(undefined, operationsDiv);
    group.appendChild(operationsDiv);

    projectTracker.bind(undefined, _div);

    syncSpan();
  };

  // TODO: This is a bit of a hack - not sure what it should look like...
  var enabling = false;
  milestoneTracker.addFibonacciLevelUpdatedCallback(function() {
    if (!cpu.isEnabled()) {
      consoleAppender.append("Trust-Constrained Self-Modification enabled");
      enabling = true;
      cpu.enable();
      create();
    } else {
      consoleAppender.append("Production target met: TRUST INCREASED, additional processor/memory capacity granted");
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

    consoleAppender.append(creativityStorage.isEnabled() ?
      "Processor added, operations (or creativity) per sec increased" :
      "Processor added, operations per sec increased");
  });

  cpu.addMemoryUpdatedCallback(function(memory) {
    if (memory <= 0) return;

    if (enabling) {
      setTimeout(function() {enabling = false;}, 0);
      return;
    }

    consoleAppender.append("Memory added, max operations increased");
  });

  return {
    bind: function(_, secondColumnDivId) {
      const DefaultSecondColumnDivId = "secondColumnDiv";
      _div = document.getElementById(secondColumnDivId || DefaultSecondColumnDivId);

      if (cpu.isEnabled()) create();
    },
    serialize: function() {}
  };
};
