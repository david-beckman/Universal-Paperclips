var autoclipperFactoryFactory = function(accountant, clipFactory, consoleAppender, initial) {
  if (!accountant || !accountant.canDebitCents ||  !accountant.debitCents) {
    console.assert(false, "No accountant hooked to the factory.");
    return false;
  }

  if (!clipFactory || !clipFactory.make) {
    console.assert(false, "No clip factory hooked to the autoclipper factory.");
    return false;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the factory.")
    return;
  }

  const InitialEnabled = false;
  const InitialClippers = 0;

  const InitialPriceCents = 500;
  const PriceFactor = 100;
  const PricePower = 1.1;
  const TicksPerSecond = 1000;
  const MakeInterval = 10;

  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _clippers = (initial && initial.clippers) || InitialClippers;
  var _enabledUpdatedCallbacks = new Array();
  var _clippersUpdatedCallbacks = new Array();

  var getCents = function() {
    if (_clippers == InitialClippers) return InitialPriceCents;
    return InitialPriceCents + Math.round(PriceFactor * Math.pow(PricePower, _clippers));
  };

  var _groupDiv;
  var _button;
  var _clippersSpan;
  var _dollarsSpan;
  var syncButtonDisabledFlag = function() {
    if (!_button) return;
    _button.disabled = !accountant.canDebitCents(getCents());
  }
  var syncSpans = function() {
    if (_clippersSpan) _clippersSpan.innerText = _clippers.toLocaleString();
    if (_dollarsSpan) _dollarsSpan.innerText = (getCents() / 100).toLocaleString(undefined, {style: "currency", currency: "USD"});
  }
  var incrementClippers = function() {
    if (!accountant.debitCents(getCents())) {
      console.warn("Insufficient funds to increment autoclippers.");
    }

    _clippers++;
    syncSpans();
    _clippersUpdatedCallbacks.forEach(function(callback) {
      setTimeout(callback(_clippers));
    });
  }

  var appendSubgroup = function() {
    if (!_groupDiv) return;

    var subgroup = document.createElement("div");
    subgroup.className = "sub-group";
    _groupDiv.appendChild(subgroup);

    var inputLine = document.createElement("div");
    subgroup.appendChild(inputLine);

    _button = document.createElement("input");
    _button.type = "button";
    _button.value = "AutoClippers";
    _button.onclick = incrementClippers;
    syncButtonDisabledFlag();
    inputLine.appendChild(_button);

    inputLine.appendChild(document.createTextNode(" "));
    inputLine.appendChild(_clippersSpan = document.createElement("span"));

    var costLine = document.createElement("div");
    subgroup.appendChild(costLine);

    costLine.appendChild(document.createTextNode("Cost: "));
    costLine.appendChild(_dollarsSpan = document.createElement("span"));

    syncSpans();
  };

  var syncEnabledFlag;
  (syncEnabledFlag = function() {
    if (_enabled || !accountant.canDebitCents(getCents())) return;
    _enabled = true;
    consoleAppender.append("AutoClippers available for purchase");
    appendSubgroup();
    _enabledUpdatedCallbacks.forEach(function(callback) {
      setTimeout(function() { callback(true); });
    });
  })();

  accountant.addCentsUpdatedCallback(function() {
    syncButtonDisabledFlag();
    syncEnabledFlag();
  });

  var remainder = 0;
  setInterval(function() {
    if (_clippers <= 0) return;
    
    var total = _clippers * MakeInterval + remainder;
    var toMake = Math.floor(total / TicksPerSecond);
    remainder = total - (toMake * TicksPerSecond);
    clipFactory.make(toMake);
  }, MakeInterval);
  
  return {
    bind: function(save, manufacturingGroupDivId) {
      if (save) {
        _enabledUpdatedCallbacks.push(save);
        _clippersUpdatedCallbacks.push(save);
      }

      const DefaultManufacturingGroupDivId = "manufacturingGroupDiv";
      _groupDiv = document.getElementById(manufacturingGroupDivId || DefaultManufacturingGroupDivId);

      if (_enabled) appendSubgroup();
    },
    serialize: function() {
      return {
        enabled: _enabled,
        clippers: _clippers
      };
    }
  };
};