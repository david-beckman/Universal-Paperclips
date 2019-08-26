var megaClipperFactoryFactory = function(accountant, clipFactory, initial) {
  if (!accountant || !accountant.canDebitCents ||  !accountant.debitCents) {
    console.assert(false, "No accountant hooked to the MegaClipper factory.");
    return false;
  }

  if (!clipFactory || !clipFactory.make) {
    console.assert(false, "No clip factory hooked to the MegaClipper factory.");
    return false;
  }

  const InitialEnabled = false;
  const InitialClippers = 0;
  const InitialEfficiency = 1;

  const InitialCents = 50e3;
  const PriceFactor = 100e3;
  const PricePower = 1.07;
  const MakeInterval = 10;
  const ClipperFactor = 500;

  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _clippers = (initial && initial.clippers) || InitialClippers;
  var _efficiency = (initial && initial.efficiency) || InitialEfficiency;
  var _enabledUpdatedCallbacks = new Array();
  var _efficiencyUpdatedCallbacks = new Array();

  var _groupDiv;
  var _button;
  var _clippersSpan;
  var _dollarsSpan;

  var incrementClippers = function() {
    if (!accountant.debitCents(getCents())) {
      console.warn("Insufficient funds to increment megaclippers.");
      return false;
    }

    _clippers++;
    syncSpans();
    return true;
  };

  var getCents = function() {
    if (_clippers == InitialClippers) return InitialCents;
    return Math.round(PriceFactor * Math.pow(PricePower, _clippers));
  };

  var syncButtonDisabledFlag = function() {
    if (!_button) return;
    _button.disabled = !accountant.canDebitCents(getCents());
  };

  var syncSpans = function() {
    if (_clippersSpan) _clippersSpan.innerText = _clippers.toLocaleString();
    if (_dollarsSpan) _dollarsSpan.innerText = (getCents() / CentsPerDollar).toUSDString();
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
    _button.value = "MegaClippers";
    _button.onclick = incrementClippers;
    syncButtonDisabledFlag();
    inputLine.appendChild(_button);

    inputLine.appendText(" ");
    inputLine.appendChild(_clippersSpan = document.createElement("span"));

    var costLine = document.createElement("div");
    subgroup.appendChild(costLine);

    costLine.appendText("Cost: ");
    costLine.appendChild(_dollarsSpan = document.createElement("span"));

    syncSpans();
  };

  accountant.addCentsUpdatedCallback(syncButtonDisabledFlag);

  var remainder = 0;
  setInterval(function() {
    if (_clippers <= 0) return;

    var total = _clippers * ClipperFactor * _efficiency * MakeInterval + remainder;
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
    isEnabled: function() {
      return _enabled;
    },
    enable: function() {
      _enabled = true;
      appendSubgroup();
      _enabledUpdatedCallbacks.forEachCallback(true);
    },
    enhance: function(percent) {
      if (!Number.isPositiveInteger(percent, "Invalid percent to enhance megaclippers: ")) {
        return false;
      }

      _efficiency += percent / 100;
      _efficiencyUpdatedCallbacks.forEachCallback(_efficiency);

      return true;
    },
    getEfficiency: function() {
      return _efficiency;
    },
    serialize: function() {
      return {
        enabled: _enabled,
        clippers: _clippers,
        efficiency: _efficiency
      };
    },
    addEnabledUpdatedCallback: function(callback) {
      if (callback) _enabledUpdatedCallbacks.push(callback);
    },
    addEfficiencyUpdatedCallback: function(callback) {
      if (callback) _efficiencyUpdatedCallbacks.push(callback);
    }
  };
};
