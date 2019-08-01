var projectTrackerFactory = function(autoclipperFactory, clipSeller, consoleAppender, operationsStorage, wireSupplier, initial) {
  if (!autoclipperFactory || !autoclipperFactory.enhance) {
    console.assert(false, "No autoclipper factory connected to the project tracker.");
    return;
  }

  if (!clipSeller || !clipSeller.enableRevTracker) {
    console.assert(false, "No clip seller connected to the project tracker.");
    return;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the project tracker.");
    return;
  }

  if (!operationsStorage || !operationsStorage.canConsume || !operationsStorage.consume || !operationsStorage.addOperationsUpdatedCallback) {
    console.assert(false, "No operations storage connected to the project tracker.");
    return;
  }

  if (!wireSupplier || !wireSupplier.getSpoolLength || !wireSupplier.increaseSpoolLength) {
    console.assert(false, "No wire supplier connected to the project tracker.");
    return;
  }

  const ProjectList = [{
    title: "Improved AutoClippers",
    description: "Increases AutoClipper performance 25%",
    cost: 750,
    trigger: function() {
      autoclipperFactory.enhance(25);
      consoleAppender.append("AutoClippper performance boosted by 25%");
    }
  }, {
    title: "Improved Wire Extrusion",
    description: "50% more wire supply from every spool",
    cost: 1750,
    trigger: function() {
      wireSupplier.increaseSpoolLength(50);
      consoleAppender.append("Wire extrusion technique improved, " + wireSupplier.getSpoolLength().toLocaleString() + " supply from every spool");
    }
  }, {
    title: "RevTracker",
    description: "Automatically calculates average revenue per second",
    cost: 500,
    trigger: function() {
      clipSeller.enableRevTracker();
      consoleAppender.append("RevTracker online");
    }
  }];

  var _projectApplied = (initial && initial.applied) || [];
  var _projectAppliedUpdatedCallbacks = new Array();
  var _projectButtons = new Array();

  operationsStorage.addOperationsUpdatedCallback(function() {
    for (var i=0; i<ProjectList.length; i++) {
      if (!_projectButtons[i]) continue;
      if (operationsStorage.canConsume(ProjectList[i].cost)) {
        _projectButtons[i].classList.remove("disabled");
      } else {
        _projectButtons[i].classList.add("disabled");
      }
    }
  });

  return {
    enable: function(){
      _enabled = true;
      build();
    },
    bind: function(save, columnElement) {
      if (save) _projectAppliedUpdatedCallbacks.push(save);

      if (!columnElement) return;

      var groupDiv = document.createElement("div");
      groupDiv.className = "group";
      columnElement.appendChild(groupDiv);

      var heading = document.createElement("h2");
      heading.innerText = "Projects";
      groupDiv.appendChild(heading);

      var onclickFactory = function(buttonDiv, index) {
        return function() {
          if (!operationsStorage.consume(ProjectList[index].cost)) {
            console.warn("Insufficient operations to trigger the " + ProjectList[index].title + " project.")
            return false;
          }

          ProjectList[index].trigger();
          _projectApplied[index] = true;
          groupDiv.removeChild(buttonDiv);
        };
      };

      for (var i=0; i<ProjectList.length; i++) {
        if (_projectApplied[i]) continue;

        var buttonDiv = document.createElement("div");
        buttonDiv.className = "project-button";
        if (!operationsStorage.canConsume(ProjectList[i].cost)) buttonDiv.classList.add("disabled");
        groupDiv.appendChild(buttonDiv);
        _projectButtons[i] = buttonDiv;

        var titleDiv = document.createElement("div");
        buttonDiv.appendChild(titleDiv);

        var titleSpan = document.createElement("span");
        titleSpan.className = "title";
        titleSpan.innerText = ProjectList[i].title;
        titleDiv.appendChild(titleSpan);
        titleDiv.appendChild(document.createTextNode(" (" + ProjectList[i].cost.toLocaleString() + " ops)"));

        var descriptionDiv = document.createElement("div");
        descriptionDiv.innerText = ProjectList[i].description;
        buttonDiv.appendChild(descriptionDiv);

        buttonDiv.onclick = onclickFactory(buttonDiv, i);
      }
    },
    serialize: function() {
      return {
        applied: _projectApplied
      };
    }
  };
};
