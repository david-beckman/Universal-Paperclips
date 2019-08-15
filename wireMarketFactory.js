var wireMarketFactory = function(accountant, wireSupplier, initial) {
  if (!accountant || !accountant.canDebitDollars || !accountant.addCentsUpdatedCallback || !accountant.debitDollars) {
    console.dir(accountant);
    console.assert(false, "No accountant hooked to the wire market.");
    return false;
  }

  if (!wireSupplier || !wireSupplier.addSpool) {
    console.dir(wireSupplier);
    console.assert(false, "No wire supplier hooked to the wire market.");
    return false;
  }

  const InitialDollars = 20;
  const InitialBaseDollars = 20;
  const InitialMarketCounter = 0;
  const InitialPurchases = 0;
  const InitialWireBuyerEnabled = false;
  const InitialWireBuyerRunning = false;

  const MinimumBaseDollars = 15;
  const PriceReductionInterval = 25e3;
  const PriceReductionFactor = 999 / 1000;
  const AdjustPriceInterval = 100;
  const AdjustmentFrequency = 0.015;
  const MarketFactor = 6;
  const DollarsIncreaseAmount = .05;

  var _dollars = (initial && initial.dollars) || InitialDollars;
  var _dollarsUpdatedCallbacks = new Array();
  var _purchases = (initial && initial.purchases) || InitialPurchases;
  var _purchasesUpdatedCallbacks = new Array();
  var _baseDollars = (initial && initial.baseDollars) || InitialBaseDollars;
  var _marketCounter = (initial && initial.marketCounter) || InitialMarketCounter;
  var _wireBuyerEnabled = (initial && initial.wireBuyerEnabled) || InitialWireBuyerEnabled;
  var _wireBuyerRunning = (initial && initial.wireBuyerRunning) || InitialWireBuyerRunning;

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
    _dollarsUpdatedCallbacks.forEach(function(callback) {
      callback(_dollars);
    });
    syncAll();
  }, AdjustPriceInterval);

  var _buyButton;
  var syncBuyButtonDisabledFlag = function() {
    if (!_buyButton) return;
    _buyButton.disabled = !accountant.canDebitDollars(_dollars);
  };
  accountant.addCentsUpdatedCallback(syncBuyButtonDisabledFlag);

  var _dollarsSpan;
  var syncAll = function() {
    syncBuyButtonDisabledFlag();
    if (!_dollarsSpan) return;
    _dollarsSpan.innerText = _dollars.toLocaleString(undefined, {style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0});
  };

  var buyWire = function() {
    if (!accountant.debitDollars(_dollars)){
      console.warn("Insufficient funds to buy a spool of wire.");
      return false;
    }

    _purchases++;
    _purchasesUpdatedCallbacks.forEach(function(callback) {
      callback(_purchases);
    });
    wireSupplier.addSpool();

    _baseDollars += DollarsIncreaseAmount;
    resetNextReductionTimestamp();

    return true;
  };

  var autoBuy = function(length) {
    if (!_wireBuyerRunning || length) return;
    buyWire();
  };

  var buildWireBuyer = function() {
    if (!_buyButton) return;

    var buyerDiv = document.createElement("div");
    _buyButton.parentNode.parentNode.insertBefore(buyerDiv, _buyButton.parentNode);

    var button = document.createElement("input");
    button.type = "button";
    button.value = "WireBuyer";
    buyerDiv.appendChild(button);
    buyerDiv.appendChild(document.createTextNode(" "));
    var span = document.createElement("span");
    buyerDiv.appendChild(span);

    var syncSpan = function() {
      span.innerText = _wireBuyerRunning ? "ON" : "OFF";
    };
    syncSpan();

    button.onclick = function() {
      _wireBuyerRunning = !_wireBuyerRunning;
      syncSpan();

      autoBuy(wireSupplier.getLength());
    };
  };

  wireSupplier.addLengthUpdatedCallback(autoBuy);

  return {
    getDollars: function() {
      return _dollars;
    },
    getPurchases: function() {
      return _purchases;
    },
    enableWireBuyer: function() {
      _wireBuyerEnabled = true;
      _wireBuyerRunning = true;

      buildWireBuyer();
    },
    bind: function(save, buyWireSpoolButtonId, wireSpoolDollarsSpanId) {
      if (save) {
        _dollarsUpdatedCallbacks.push(save);
        _purchasesUpdatedCallbacks.push(save);
      }

      const DefaultBuyWireSpoolButtonId = "buyWireSpoolButton";
      const DefaultWireSpoolDollarsSpanId = "wireSpoolDollarsSpan";

      _dollarsSpan = document.getElementById(wireSpoolDollarsSpanId || DefaultWireSpoolDollarsSpanId);
      _buyButton = document.getElementById(buyWireSpoolButtonId || DefaultBuyWireSpoolButtonId);
      _buyButton.onclick = buyWire;
      syncAll();

      if (_wireBuyerEnabled) buildWireBuyer();
    },
    serialize: function() {
      return {
        baseDollars: _baseDollars,
        dollars: _dollars,
        marketCounter: _marketCounter,
        nextReductionTimeout: _nextReductionTimestamp - new Date().getTime(),
        purchases: _purchases,
        wireBuyerEnabled: _wireBuyerEnabled,
        wireBuyerRunning: _wireBuyerRunning
      };
    },
    addDollarsUpdatedCallback: function(callback) {
      if (callback) _dollarsUpdatedCallbacks.push(callback);
    },
    addPurchasesUpdatedCallback: function(callback) {
      if (callback) _purchasesUpdatedCallbacks.push(callback);
    }
  };
};
