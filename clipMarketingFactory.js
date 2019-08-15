var clipMarketingFactory = function(accountant, initial) {
  if (!accountant || !accountant.canDebitDollars || !accountant.debitDollars || !accountant.addCentsUpdatedCallback) {
    console.dir(accountant);
    console.assert(false, "No accountant hooked to marketing.");
    return;
  }

  const InitialLevel = 1;

  const BaseDollars = 100;
  const IncrementPower = 2;

  var _level = (initial && initial.level) || InitialLevel;
  var _levelUpdatedCallbacks = new Array();

  var getDollars = function() {
    return BaseDollars * Math.pow(IncrementPower, _level - 1);
  };

  var _incrementLevelButton;
  var syncIncrementButtonDisabledFlag = function(){
    if (!_incrementLevelButton) return;
    _incrementLevelButton.disabled = !accountant.canDebitDollars(getDollars());
  };

  accountant.addCentsUpdatedCallback(function() {
    syncIncrementButtonDisabledFlag();
  });

  return {
    getLevel: function() {
      return _level;
    },
    bind: function(save, incrementMarketingLevelButtonId, marketingLevelSpanId, marketingLevelDollarsSpanId) {
      if (save) _levelUpdatedCallbacks.push(save);

      const DefaultIncrementMarketingLevelButtonId = "incrementMarketingLevelButton";
      const DefaultmarketingLevelSpanId = "marketingLevelSpan";
      const DefaultMarketingLevelDollarsSpanId = "marketingLevelDollarsSpan";

      _incrementLevelButton = document.getElementById(incrementMarketingLevelButtonId || DefaultIncrementMarketingLevelButtonId);
      var levelSpan = document.getElementById(marketingLevelSpanId || DefaultmarketingLevelSpanId);
      var dollarsSpan = document.getElementById(marketingLevelDollarsSpanId || DefaultMarketingLevelDollarsSpanId);

      var syncAll;
      (syncAll = function() {
        syncIncrementButtonDisabledFlag();
        levelSpan.innerText = _level.toLocaleString();
        dollarsSpan.innerText = getDollars().toLocaleString(undefined, {style: "currency", currency: "USD"});
      })();

      _incrementLevelButton.onclick = function() {
        if (!accountant.debitDollars(getDollars())) {
          console.assert(false, "Insufficient funds to increase the marketing level.");
          return false;
        }

        _level++;
        syncAll();

        _levelUpdatedCallbacks.forEach(function(callback) {
          setTimeout(function() { callback(_level); });
        });
        return true;
      };
    },
    addLevelUpdatedCallback: function(callback) {
      if (callback) _levelUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        level: _level
      };
    }
  };
};
