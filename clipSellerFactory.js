var clipSellerFactory = function(accountant, clipMarketing, clipPricer, clipWarehouse, initial) {
  if (!accountant || !accountant.creditCents) {
    console.assert(false, "No accountant hooked to the seller.");
    return false;
  }

  if (!clipMarketing || !clipMarketing.getLevel || !clipMarketing.addLevelUpdatedCallback || !clipMarketing.getEffectiveness) {
    console.assert(false, "No marketing hooked to the seller.");
    return false;
  }

  if (!clipPricer || !clipPricer.getCents || !clipPricer.addCentsUpdatedCallback) {
    console.assert(false, "No pricer hooked to the seller.");
    return false;
  }

  if (!clipWarehouse || !clipWarehouse.getUnshipped || !clipWarehouse.ship || !clipWarehouse.addUnshippedUpdatedCallback) {
    console.assert(false, "No warehouse hooked to the seller.");
    return false;
  }

  const InitialRevTrackerEnabled = false;
  const InitialDemandBoost = 1;

  var _revTrackerEnabled = (initial && initial.revTrackerEnabled) || InitialRevTrackerEnabled;
  var _demandBoost = (initial && initial.demandBoost) || InitialDemandBoost;

  const MarketingPower = 1.1;
  const PricingFactor = 80;
  const SellInterval = 100;
  const DemandFactor = .7;
  const DemandPower = 1.15;

  var _rpsSpan;
  var _cspsSpan;
  var _demandSpan;

  var getDemandPercent = function() {
    var marketingBoost = Math.pow(MarketingPower, clipMarketing.getLevel() - 1) * clipMarketing.getEffectiveness() * _demandBoost;
    var pricingBoost = PricingFactor / clipPricer.getCents();
    return marketingBoost * pricingBoost;
  };

  var getIdealCPS = function() {
    var demand = getDemandPercent();
    var chanceOfSale = Math.min(demand / 100, 1);
    var amountOfSale = DemandFactor * Math.pow(demand, DemandPower);
    var idealCPS = Math.round(chanceOfSale * amountOfSale * TicksPerSecond / SellInterval);
    return Math.min(idealCPS, clipWarehouse.getUnshipped());
  };

  var syncRevTracker = function() {
    var idealCPS = getIdealCPS();
    if (_cspsSpan) _cspsSpan.innerText = idealCPS.toLocaleString();
    if (_rpsSpan) _rpsSpan.innerText = (idealCPS * clipPricer.getCents() / CentsPerDollar).toUSDString();
  };

  var syncSpans = function() {
    // Bug: Why 10 and not 100?
    if (_demandSpan) _demandSpan.innerText = (getDemandPercent() / 10).toLocaleString(undefined, {style: "percent"});
    syncRevTracker();
  };

  clipPricer.addCentsUpdatedCallback(syncSpans);
  clipMarketing.addLevelUpdatedCallback(syncSpans);
  clipMarketing.addEffectivenessUpdatedCallback(syncSpans);

  clipWarehouse.addUnshippedUpdatedCallback(syncRevTracker);

  var addRevTracker = function() {
    if (!_demandSpan) return;

    var demandDiv = _demandSpan.parentNode;
    var groupDiv = demandDiv.parentNode;

    var rpsDiv = document.createElement("div");
    groupDiv.insertBefore(rpsDiv, demandDiv.previousElementSibling.previousElementSibling);
    rpsDiv.appendText("Avg. Rev. per sec: ");

    _rpsSpan = document.createElement("span");
    rpsDiv.appendChild(_rpsSpan);

    var cspsDiv = document.createElement("div");
    groupDiv.insertBefore(cspsDiv, demandDiv.previousElementSibling.previousElementSibling);
    cspsDiv.appendText("Avg. Clips Sold per sec: ");

    _cspsSpan = document.createElement("span");
    cspsDiv.appendChild(_cspsSpan);
  };

  setInterval(function() {
    var demand = getDemandPercent();

    if (Math.random() >= (demand / 100)) return false;

    var demandAmount = Math.floor(DemandFactor * Math.pow(demand, DemandPower));
    var toShip = Math.min(demandAmount, clipWarehouse.getUnshipped());
    if (toShip <= 0) return false;

    if (!clipWarehouse.ship(toShip)) {
        console.warn("Could not ship " + toShip + " clips.");
        return false;
    }

    if (!accountant.creditCents(toShip * clipPricer.getCents())) {
        console.warn("Could not credit account from shipped clips.");
        return false;
    }

    return true;
  }, SellInterval);

  return {
    bind: function() {
      const DefaultPublicDemandPercentSpanId = "publicDemandPercentSpan";

      _demandSpan = document.getElementById(DefaultPublicDemandPercentSpanId);

      if (_revTrackerEnabled) {
        addRevTracker();
      }

      syncSpans();
    },
    boostDemand: function(factor) {
      if (!Number.isPositiveInteger(factor)) return false;

      _demandBoost *= factor;
      return true;
    },
    enableRevTracker: function() {
      _revTrackerEnabled = true;
      addRevTracker();
    },
    serialize: function() {
      return {
        demandBoost: _demandBoost,
        revTrackerEnabled: _revTrackerEnabled
      };
    }
  };
};
