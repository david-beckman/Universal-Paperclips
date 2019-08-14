var projectTrackerFactory = function(accountant, autoclipperFactory, clipSeller, clipWarehouse, consoleAppender, cpu, creativityStorage, operationsStorage, trustWarehouse, wireMarket, wireSupplier, initial) {
  if (!accountant || !accountant.getCents || !accountant.addCentsUpdatedCallback) {
    console.assert(false, "No accountant connected to the project tracker.");
    return;
  }

  if (!autoclipperFactory || !autoclipperFactory.enhance || !autoclipperFactory.getClippers || !autoclipperFactory.addClippersUpdatedCallback) {
    console.assert(false, "No autoclipper factory connected to the project tracker.");
    return;
  }

  if (!clipSeller || !clipSeller.enableRevTracker) {
    console.assert(false, "No clip seller connected to the project tracker.");
    return;
  }

  if (!clipWarehouse || !clipWarehouse.getUnshipped || !clipWarehouse.addUnshippedUpdatedCallback) {
    console.assert(false, "No clip warehouse connected to the project tracker.");
    return;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the project tracker.");
    return;
  }

  if (!cpu || !cpu.isEnabled) {
    console.assert(false, "No CPU connected to the project tracker.");
    return;
  }

  if (!creativityStorage || !creativityStorage.enable) {
    console.assert(false, "No creativity storage connected to the project tracker.");
    return;
  }

  if (!operationsStorage || !operationsStorage.canConsume || !operationsStorage.consume || !operationsStorage.addOperationsUpdatedCallback) {
    console.assert(false, "No operations storage connected to the project tracker.");
    return;
  }

  if (!trustWarehouse || !trustWarehouse.useTrust) {
    console.assert(false, "No trust warehouse connected to the project tracker.");
    return;
  }

  if (!wireMarket || !wireMarket.getDollars || !wireMarket.addDollarsUpdatedCallback || !wireMarket.getPurchases || !wireMarket.addPurchasesUpdatedCallback) {
    console.assert(false, "No wire market connected to the project tracker.");
    return;
  }

  if (!wireSupplier || !wireSupplier.getLength || !wireSupplier.getSpoolLength || !wireSupplier.increaseSpoolLength || !wireSupplier.addSpool || !wireSupplier.addLengthUpdatedCallback) {
    console.assert(false, "No wire supplier connected to the project tracker.");
    return;
  }

  const ProjectList = [{
    title: "Beg for More Wire",
    description: "Admit failure, ask for budget increase to cover cost of 1 spool",
    cost: { trust: 1 },
    isVisible: function() {
      return clipWarehouse.getUnshipped() <= 0 &&
        wireSupplier.getLength() <= 0 &&
        accountant.getCents() < (wireMarket.getDollars() * 100);
    },
    trigger: function() {
      wireSupplier.addSpool();
      consoleAppender.append("Budget overage approved, 1 spool of wire requisitioned from HQ");
    },
    disableAppliedTracking: true
  }, {
    title: "Creativity",
    description: "Use idle operations to generate new problems and new solutions",
    cost: { operations: 1000 },
    isVisible: function() {
      return cpu.isEnabled() && operationsStorage.isAtMax();
    },
    trigger: function() {
      creativityStorage.enable();
      consoleAppender.append("Creativity unlocked (creativity increases while operations are at max)");
    }
  }, {
    title: "Improved AutoClippers",
    description: "Increases AutoClipper performance 25%",
    cost: { operations: 750 },
    isVisible: function() {
      return cpu.isEnabled() && autoclipperFactory.getClippers() > 0;
    },
    trigger: function() {
      autoclipperFactory.enhance(25);
      consoleAppender.append("AutoClippper performance boosted by 25%");
    }
  }, {
    title: "Improved Wire Extrusion",
    description: "50% more wire supply from every spool",
    cost: { operations: 1750 },
    isVisible: function() {
      return cpu.isEnabled() && wireMarket.getPurchases() > 0;
    },
    trigger: function() {
      wireSupplier.increaseSpoolLength(50);
      consoleAppender.append("Wire extrusion technique improved, " + wireSupplier.getSpoolLength().toLocaleString() + " supply from every spool");
    }
  }, {
    title: "RevTracker",
    description: "Automatically calculates average revenue per second",
    cost: { operations: 500 },
    isVisible: function() {
      return cpu.isEnabled();
    },
    trigger: function() {
      clipSeller.enableRevTracker();
      consoleAppender.append("RevTracker online");
    }
  }];

  const InitialApplied = [];
  const InitialVisible = [];

  var _projectApplied = (initial && initial.applied) || InitialApplied;
  var _projectVisible = (initial && initial.visible) || InitialVisible;
  var _projectAppliedUpdatedCallbacks = new Array();
  var _visibilityUpdatedCallbacks = new Array();
  var _projectButtons = new Array();
  var _groupDiv;

  var createButton = function(index) {
    if (!_groupDiv) return;

    var onclickFactory = function(index) {
      return function() {
        if (!_projectButtons[index] || _projectButtons[index].classList.contains("disabled")) return;

        var project = ProjectList[index];
        var ops = project.cost.operations;
        var trust = project.cost.trust;
        if (ops) {
          if (!operationsStorage.consume(ops)) {
            console.warn("Insufficient operations to trigger the " + project.title + " project.");
            return false;
          }
        }
        if (trust) {
          if (!trustWarehouse.useTrust(trust)) {
            console.warn("Insufficient trust to trigger the " + project.title + " project.");
            return false;
          }
        }

        project.trigger();
        _projectApplied[index] = !project.disableAppliedTracking;
        _projectVisible[index] = false;
        _groupDiv.removeChild(_projectButtons[index]);
        _projectButtons[index] = undefined;

        _projectAppliedUpdatedCallbacks.forEach(function(callback) {
          setTimeout(function() { callback(true); }, 0);
        });
      };
    };

    var ops = ProjectList[index].cost.operations;
    var trust = ProjectList[index].cost.trust;
    var buttonDiv = _projectButtons[index] = document.createElement("div");
    buttonDiv.className = "project-button";
    if (ops && !operationsStorage.canConsume(ops)) buttonDiv.classList.add("disabled");
    _groupDiv.appendChild(buttonDiv);

    var titleDiv = document.createElement("div");
    buttonDiv.appendChild(titleDiv);

    var titleSpan = document.createElement("span");
    titleSpan.className = "title";
    titleSpan.innerText = ProjectList[index].title;
    titleDiv.appendChild(titleSpan);
    if (ops || trust) {
      titleDiv.appendChild(document.createTextNode(" ("));
      if (ops) titleDiv.appendChild(document.createTextNode(ops.toLocaleString() + " ops"));
      if (ops && trust) titleDiv.appendChild(document.createTextNode(", "));
      if (trust) titleDiv.appendChild(document.createTextNode( + trust.toLocaleString() + " Trust"));
      titleDiv.appendChild(document.createTextNode(")"));
    }

    var descriptionDiv = document.createElement("div");
    descriptionDiv.innerText = ProjectList[index].description;
    buttonDiv.appendChild(descriptionDiv);

    buttonDiv.onclick = onclickFactory(index);
  };

  var syncVisibility = function() {
    var updated = false;
    for (var i=0; i<ProjectList.length; i++) {
      var previous = _projectVisible[i] || false;
      _projectVisible[i] = !_projectApplied[i] && (previous || ProjectList[i].isVisible());
      updated = updated || (previous != _projectVisible[i]);

      if (!_projectVisible[i]) {
        if (_projectButtons[i]) {
          if (_groupDiv) _groupDiv.removeChild(_projectButtons[index]);
          _projectButtons[i] = undefined;
        }
      } else if (!_projectButtons[i]) {
        createButton(i);
      }
    }

    if (updated) {
      _visibilityUpdatedCallbacks.forEach(function(callback) {
        setTimeout(function() { callback(true); }, 0);
      });
    }
  };

  var syncEnabled = function() {
    for (var i=0; i<ProjectList.length; i++) {
      if (!_projectButtons[i]) continue;
      var ops = ProjectList[i].cost.operations;
      if (!ops || operationsStorage.canConsume(ops)) {
        _projectButtons[i].classList.remove("disabled");
      } else {
        _projectButtons[i].classList.add("disabled");
      }
    }
  };

  accountant.addCentsUpdatedCallback(syncVisibility);
  autoclipperFactory.addClippersUpdatedCallback(syncVisibility);
  clipWarehouse.addUnshippedUpdatedCallback(syncVisibility);
  wireMarket.addPurchasesUpdatedCallback(syncVisibility);
  wireSupplier.addLengthUpdatedCallback(syncVisibility);
  operationsStorage.addOperationsUpdatedCallback(syncVisibility);

  operationsStorage.addOperationsUpdatedCallback(syncEnabled);

  return {
    bind: function(save, columnElement) {
      if (save) _projectAppliedUpdatedCallbacks.push(save);

      if (!columnElement) return;

      _groupDiv = document.createElement("div");
      _groupDiv.className = "group";
      columnElement.appendChild(_groupDiv);

      var heading = document.createElement("h2");
      heading.innerText = "Projects";
      _groupDiv.appendChild(heading);

      syncVisibility();
    },
    serialize: function() {
      return {
        applied: _projectApplied,
        visible: _projectVisible
      };
    },
    addProjectVisibilityUpdatedCallback: function(callback) {
      if (callback) _visibilityUpdatedCallbacks.push(callback);
    }
  };
};
