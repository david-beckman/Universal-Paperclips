var wireMarketFactory = function(accountant, wireSupplier, initial) {
  if (!accountant || !accountant.canDebitDollars || !accountant.addCentsUpdatedCallback || !accountant.debitDollars) {
    console.dir(accountant);
    console.assert(false, "No accountant hooked to the market.");
    return false;
  }

  if (!wireSupplier || !wireSupplier.addSpool) {
    console.dir(wireSupplier);
    console.assert(false, "No supplier hooked to the market.");
    return false;
  }

  const InitialDollars = 20;
  const InitialBaseDollars = 20;
  const InitialMarketCounter = 0;

  const MinimumBaseDollars = 15;
  const PriceReductionInterval = 25000;
  const PriceReductionFactor = 999 / 1000;
  const AdjustPriceInterval = 100;
  const AdjustmentFrequency = 0.015;
  const MarketFactor = 6;
  const DollarsIncreaseAmount = .05;

  var _dollars = (initial && initial.dollars) || InitialDollars;
  var _baseDollars = (initial && initial.baseDollars) || InitialBaseDollars;
  var _marketCounter = (initial && initial.marketCounter) || InitialMarketCounter;

  var _nextReductionTimestamp = 0;

  var resetNextReductionTimestamp;
  (resetNextReductionTimestamp = function(interval) {
    interval = interval || (interval === 0 ? 0 : PriceReductionInterval);
    _nextReductionTimestamp = new Date().getTime() + interval;
  })(initial && initial.nextReductionTimeout);

  setInterval(function() {
    // Reduce base price
    if (_baseDollars > MinimumBaseDollars && new Date().getTime() > _nextReductionTimestamp) {
      _baseDollars *= PriceReductionFactor;
      resetNextReductionTimestamp();
    }

    // Apply specific price
    if (Math.random() >= AdjustmentFrequency) return;
    _marketCounter++;
    var marketDollarsAdjustment = MarketFactor * Math.sin(_marketCounter);
    var newDollars = Math.ceil(_baseDollars + marketDollarsAdjustment);

    if (newDollars === _dollars) return;
    _dollars = newDollars;
    syncAll();
  }, AdjustPriceInterval);

  var _button;
  var syncButtonDisabledFlag = function() {
    if (!_button) return;
    _button.disabled = !accountant.canDebitDollars(_dollars);
  };
  accountant.addCentsUpdatedCallback(syncButtonDisabledFlag);

  var _span;
  var syncAll = function() {
    syncButtonDisabledFlag();
    if (!_span) return;
    _span.innerText = _dollars.toLocaleString(undefined, {style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0});
  };

  return {
    bind: function(_, buyWireSpoolButtonId, wireSpoolPriceDollarsSpanId) {
      const DefaultBuyWireSpoolButtonId = "buyWireSpoolButton";
      const DefaultWireSpoolPriceDollarsSpanId = "wireSpoolPriceDollarsSpan";

      _button = document.getElementById(buyWireSpoolButtonId || DefaultBuyWireSpoolButtonId);
      _span = document.getElementById(wireSpoolPriceDollarsSpanId || DefaultWireSpoolPriceDollarsSpanId);
      syncAll();

      _button.onclick = function() {
        if (!accountant.debitDollars(_dollars)){
          console.warn("Insufficient funds to buy a spool of wire.");
          return false;
        }

        wireSupplier.addSpool();

        _baseDollars += DollarsIncreaseAmount;
        resetNextReductionTimestamp();

        return true;
      };
    },
    serialize: function() {
      return {
        baseDollars: _baseDollars,
        dollars: _dollars,
        marketCounter: _marketCounter,
        nextReductionTimeout: _nextReductionTimestamp - new Date().getTime()
      };
    }
  };
};
