var trustWarehouseFactory = function(clipFactory, initial) {
  if (!clipFactory || !clipFactory.addClipsUpdatedCallback) {
    console.assert(false, "No factory connected to the trust warehouse.");
    return;
  }

  const InitialLevel = 1;

  const ClipFactor = 1000;

  var _fibonacci = [1, 2, 3];
  var _levelUpdatedCallbacks = new Array();
  var _level = (initial && initial.level) || InitialLevel;

  var _trustSpan;
  var _productionSpan;

  var getProductionGoal = function() {
    while (_fibonacci.length <= (_level)) {
      _fibonacci[_fibonacci.length] = _fibonacci[_fibonacci.length - 1] + _fibonacci[_fibonacci.length - 2];
    }

    return ClipFactor * _fibonacci[_level];
  };

  var syncSpans = function() {
    if (_trustSpan) _trustSpan.innerText = _level.toLocaleString();
    if (_productionSpan) _productionSpan.innerText = getProductionGoal().toLocaleString();
  };

  clipFactory.addClipsUpdatedCallback(function(clips) {
    if (clips < getProductionGoal()) return;

    _level++;
    syncSpans();
    _levelUpdatedCallbacks.forEach(function(callback) {
      setTimeout(function() { callback(_level); }, 0);
    });
  });

  return {
    getLevel() {
      return _level;
    },
    bind: function(save, subgroupDiv) {
      if (save) _levelUpdatedCallbacks.push(save);

      if (!subgroupDiv) return;

      var trustDiv = document.createElement("div");
      trustDiv.appendChild(document.createTextNode("Trust: "));
      trustDiv.appendChild(_trustSpan = document.createElement("span"));
      subgroupDiv.appendChild(trustDiv);

      var productionGoalDiv = document.createElement("div");
      productionGoalDiv.appendChild(document.createTextNode("+1 Trust at: "));
      productionGoalDiv.appendChild(_productionSpan = document.createElement("span"));
      productionGoalDiv.appendChild(document.createTextNode(" clips"));
      subgroupDiv.appendChild(productionGoalDiv);

      syncSpans();
    },
    serialize: function() {
      return {
        level: _level
      };
    },
    addLevelUpdatedCallback: function(callback) {
      if (callback) _levelUpdatedCallbacks.push(callback);
    }
  };
};
