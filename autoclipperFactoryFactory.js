var autoclipperFactoryFactory = function(accountant, clipFactory, consoleAppender, initial) {
  if (!accountant || !accountant.canDebitCents ||  !accountant.debitCents) {
    console.assert(false, "No accountant hooked to the AutoClipper factory.");
    return false;
  }

  if (!clipFactory || !clipFactory.make) {
    console.assert(false, "No clip factory hooked to the AutoClipper factory.");
    return false;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the AutoClipper factory.");
    return;
  }

  const InitialEnabled = false;
  const InitialClippers = 0;
  const InitialEfficiency = 1;

  const InitialCents = 500;
  const PriceFactor = 100;
  const PricePower = 1.1;
  const MakeInterval = 10;

  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _clippers = (initial && initial.clippers) || InitialClippers;
  var _efficiency = (initial && initial.efficiency) || InitialEfficiency;
  var _clippersUpdatedCallbacks = new Array();
  var _efficiencyUpdatedCallbacks = new Array();

  var getCents = function() {
    if (_clippers == InitialClippers) return InitialCents;
    return InitialCents + Math.round(PriceFactor * Math.pow(PricePower, _clippers));
  };

  var _groupDiv;
  var _button;
  var _clippersSpan;
  var _dollarsSpan;

  var syncButtonDisabledFlag = function() {
    if (!_button) return;
    _button.disabled = !accountant.canDebitCents(getCents());
  };

  var syncSpans = function() {
    if (_clippersSpan) _clippersSpan.innerText = _clippers.toLocaleString();
    if (_dollarsSpan) _dollarsSpan.innerText = (getCents() / CentsPerDollar).toUSDString();
  };

  var incrementClippers = function() {
    if (!accountant.debitCents(getCents())) {
      console.warn("Insufficient funds to increment autoclippers.");
      return false;
    }

    _clippers++;
    syncSpans();
    _clippersUpdatedCallbacks.forEachCallback(_clippers);
    return true;
  };

  var appendSubgroup = function() {
    if (!_groupDiv) return;

    var subgroup = document.createElement("div");
    subgroup.className = "sub-group";
    _groupDiv.appendChild(subgroup);

    var inputLine = document.createElement("div");
    subgroup.appendChild(inputLine);

    _button = document.createElement("input");
    _button.type = "button";
    _button.id = "createClipperButton";
    _button.value = "AutoClippers";
    _button.onclick = incrementClippers;
    syncButtonDisabledFlag();
    inputLine.appendChild(_button);

    inputLine.appendText(" ");
    inputLine.appendChild(_clippersSpan = document.createElement("span"));

    var costLine = document.createElement("div");
    subgroup.appendChild(costLine);

    costLine.appendText("Cost: ");
    costLine.appendChild(_dollarsSpan = document.createElement("span"));
    _dollarsSpan.id = "clipperDollarsSpan";

    syncSpans();
  };

  var syncEnabledFlag;
  (syncEnabledFlag = function() {
    if (_enabled || !accountant.canDebitCents(getCents())) return;
    _enabled = true;
    consoleAppender.append("AutoClippers available for purchase");
    appendSubgroup();
  })();

  accountant.addCentsUpdatedCallback(function() {
    syncButtonDisabledFlag();
    syncEnabledFlag();
  });

  var remainder = 0;
  setInterval(function() {
    if (_clippers <= 0) return;

    var total = _clippers * _efficiency * MakeInterval + remainder;
    var toMake = Math.floor(total / TicksPerSecond);
    remainder = total - (toMake * TicksPerSecond);
    if (toMake > 0) {
      var extras = toMake - clipFactory.make(toMake);
      if (extras === toMake) remainder = 0; // No wire left
      else if (extras !== 0) remainder += extras * TicksPerSecond; // Partial wire left
    }
  }, MakeInterval);

  return {
    bind: function() {
      const DefaultManufacturingGroupDivId = "manufacturingGroupDiv";
      _groupDiv = document.getElementById(DefaultManufacturingGroupDivId);

      if (_enabled) appendSubgroup();
    },
    getClippers: function() {
      return _clippers;
    },
    getEfficiency: function() {
      return _efficiency;
    },
    enhance: function(percent) {
      if (!Number.isPositiveInteger(percent, "Invalid percent to enhance autoclippers: ")) {
        return false;
      }

      _efficiency += percent / 100;
      _efficiencyUpdatedCallbacks.forEachCallback(_efficiency);

      return true;
    },
    serialize: function() {
      return {
        enabled: _enabled,
        clippers: _clippers,
        efficiency: _efficiency
      };
    },
    addClippersUpdatedCallback: function(callback) {
      if (callback) _clippersUpdatedCallbacks.push(callback);
    },
    addEfficiencyUpdatedCallback: function(callback) {
      if (callback) _efficiencyUpdatedCallbacks.push(callback);
    }
  };
};
