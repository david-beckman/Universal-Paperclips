var computerFactory = function(consoleAppender, cpu, operationsStorage, projectTracker, trustWarehouse, _) {
  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the computer.");
    return;
  }

  if (!cpu || !cpu.bind || !cpu.enable) {
    console.assert(false, "No CPU connected to the computer.");
    return;
  }

  if (!operationsStorage || !operationsStorage.bind) {
    console.assert(false, "No operations storage connected to the computer.");
    return;
  }

  if (!projectTracker || !projectTracker.bind) {
    console.assert(false, "No project tracker connected to the computer.");
    return;
  }

  if (!trustWarehouse || !trustWarehouse.bind || !trustWarehouse.addLevelUpdatedCallback) {
    console.assert(false, "No trust warehouse connected to the computer.");
    return;
  }

  const MinimumTrustLevel = 2;

  var _div;

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
    trustWarehouse.bind(undefined, trustDiv);
    group.appendChild(trustDiv);

    var cpuDiv = document.createElement("div");
    cpuDiv.className = "sub-group";
    cpu.bind(undefined, cpuDiv);
    group.appendChild(cpuDiv);

    var operationsDiv = document.createElement("div");
    operationsDiv.className = "sub-group";
    operationsStorage.bind(undefined, operationsDiv);
    group.appendChild(operationsDiv);

    projectTracker.bind(undefined, _div);
  };

  trustWarehouse.addLevelUpdatedCallback(function(level) {
    if (level == MinimumTrustLevel) {
      consoleAppender.append("Trust-Constrained Self-Modification enabled");
      cpu.enable();
      create();
    } else {
      consoleAppender.append("Production target met: TRUST INCREASED, additional processor/memory capacity granted");
    }
  });

  return {
    bind: function(_, secondColumnDivId) {
      const DefaultSecondColumnDivId = "secondColumnDiv";
      _div = document.getElementById(secondColumnDivId || DefaultSecondColumnDivId);

      if (trustWarehouse.getLevel() >= MinimumTrustLevel) create();
    },
    serialize: function() {}
  };
};
