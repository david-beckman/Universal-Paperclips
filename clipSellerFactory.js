var clipSellerFactory = function(accountant, clipMarketing, clipPricer, clipWarehouse, _) {
  if (!accountant || !accountant.creditCents) {
    console.assert(false, "No accountant hooked to the seller.");
  }

  if (!clipMarketing || !clipMarketing.getLevel || !clipMarketing.addLevelUpdatedCallback) {
    console.assert(false, "No marketing hooked to the seller.");
    return false;
  }

  if (!clipPricer || !clipPricer.getPriceCents || !clipPricer.addPriceCentsUpdatedCallback) {
    console.assert(false, "No pricer hooked to the seller.");
    return false;
  }

  if (!clipWarehouse || !clipWarehouse.getUnshipped || !clipWarehouse.ship) {
    console.assert(false, "No warehouse hooked to the seller.");
    console.dir(clipWarehouse);
    return false;
  }

  const MarketingPower = 1.1;
  const PricingFactor = 80;
  const SellInterval = 100;
  const DemandFactor = .7;
  const DemandPower = 1.15;

  var getDemandPercent = function() {
    var marketingBoost = Math.pow(MarketingPower, clipMarketing.getLevel() - 1);
    var pricingBoost = PricingFactor / clipPricer.getPriceCents();
    return marketingBoost * pricingBoost;
  }

  var _span;
  var syncSpan= function() {
    if (!_span) return;
    // Bug: Why 10 and not 100?
    _span.innerText = (getDemandPercent() / 10).toLocaleString(undefined, {style: "percent"});
  }

  clipPricer.addPriceCentsUpdatedCallback(function() {
    syncSpan();
  });

  clipMarketing.addLevelUpdatedCallback(function() {
    syncSpan();
  });

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

    if (!accountant.creditCents(toShip * clipPricer.getPriceCents())) {
        console.warn("Could not credit account from shipped clips.")
        return false;
    }

    return true;
  }, SellInterval);

  return {
    bind: function(_, publicDemandPercentSpanId) {
      const DefaultPublicDemandPercentSpanId = "publicDemandPercentSpan";

      _span = document.getElementById(publicDemandPercentSpanId || DefaultPublicDemandPercentSpanId);
      syncSpan();
    },
    serialize: function() {
      return;
    }
  };
};
