var clipMarketingConstructor = function(accountant, initial) {
  if (!accountant || !accountant.canDebitDollars || !accountant.debitDollars || !accountant.addCentsUpdatedCallback) {
    console.assert(false, "No accountant hooked to marketing.");
    return;
  }

  const InitialLevel = 1;
  const InitialEffectiveness = 1;

  const BaseDollars = 100;
  const IncrementPower = 2;

  var _level = (initial && initial.level) || InitialLevel;
  var _effectiveness = (initial && initial.effectiveness) || InitialEffectiveness;
  var _levelUpdatedCallbacks = [];
  var _effectivenessUpdatedCallbacks = [];

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
    getEffectiveness: function() {
      return _effectiveness;
    },
    bind: function() {
      const DefaultIncrementMarketingLevelButtonId = "incrementMarketingLevelButton";
      const DefaultmarketingLevelSpanId = "marketingLevelSpan";
      const DefaultMarketingLevelDollarsSpanId = "marketingLevelDollarsSpan";

      _incrementLevelButton = document.getElementById(DefaultIncrementMarketingLevelButtonId);
      var levelSpan = document.getElementById(DefaultmarketingLevelSpanId);
      var dollarsSpan = document.getElementById(DefaultMarketingLevelDollarsSpanId);

      var syncAll;
      (syncAll = function() {
        syncIncrementButtonDisabledFlag();
        levelSpan.innerText = _level.toLocaleString();
        dollarsSpan.innerText = getDollars().toUSDString();
      })();

      _incrementLevelButton.onclick = function() {
        if (!accountant.debitDollars(getDollars())) {
          console.assert(false, "Insufficient funds to increase the marketing level.");
          return false;
        }

        _level++;
        syncAll();

        _levelUpdatedCallbacks.forEachCallback(_level);
        return true;
      };
    },
    enhance: function(percent) {
      if (!Number.isPositiveInteger(percent, "Invalid percent to enhance marketing: ")) {
        return false;
      }

      _effectiveness *= (1 + percent / 100);
      _effectivenessUpdatedCallbacks.forEachCallback(_effectiveness);

      return true;
    },
    addLevelUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _levelUpdatedCallbacks.push(callback);
    },
    addEffectivenessUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _effectivenessUpdatedCallbacks.push(callback);
    },
    serialize: function() {
      return {
        level: _level,
        effectiveness: _effectiveness
      };
    }
  };
};
