var stockTraderConstructor = function(accountant, consoleAppender, stockMarket, initial) {
  if (!accountant || !accountant.creditDollars || !accountant.debitDollars || !accountant.getCents) {
    console.assert(false, "No accountant hooked to the stock trader.");
    return;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender hooked to the stock trader.");
    return;
  }

  if (!stockMarket || !stockMarket.addStockDollarsUpdatedCallback || !stockMarket.bind || !stockMarket.buyStock ||
      !stockMarket.getLength || !stockMarket.getMaxLength || !stockMarket.getStockDollars || !stockMarket.sellStock) {
    console.assert(false, "No stock market hooked to the stock trader.");
    return;
  }

  const InitialDollars = 0;
  const InitialEnabled = false;
  const InitialInjectedDollars = 0;
  const InitialReportTimeout = 100e3; // 100s = 1m 40s (timeout rather than interval due to the length)
  const InitialRiskName = "Low Risk";
  const InitialSellStockTimeout = 10e3; // 10s

  const BuyFrequency = .25;
  const BuyStockInterval = 1e3; // 1s
  const HighRiskName = "High Risk";
  const MinimumReserve = 5;
  const RiskNames = [InitialRiskName, "Med Risk", HighRiskName];
  const SellFrequency = .3;
  const SellStockInterval = 2500; // 2.5s

  var riskMap = [];
  riskMap[RiskNames[0]] = 7;
  riskMap[RiskNames[1]] = 5;
  riskMap[RiskNames[2]] = 1;

  var _dollars = (initial && initial.dollars) || InitialDollars;
  var _enabled = (initial && initial.enabled) || InitialEnabled;
  var _injectedDollars = (initial && initial.injectedDollars) || InitialInjectedDollars;
  var _riskName = (initial && initial.riskName) || InitialRiskName;
  var _reportTime = new Date().getTime() + ((initial && initial.reportTimeout) || InitialReportTimeout);
  var _sellStockTime = new Date().getTime() +
    (initial && (initial.sellStockTimeout || initial.sellStockTimeout === 0) ? initial.sellStockTimeout : InitialSellStockTimeout);

  var _columnDiv;
  var _dollarsSpan;
  var _select;
  var _stocksSpan;
  var _totalSpan;

  var appendReport = function() {
    if (!_enabled) return;

    var amt = getTotalDollars() - _injectedDollars;
    consoleAppender.append("Lifetime investment revenue report: " + amt.toUSDString());

    _reportTime = new Date().getTime() + InitialReportTimeout;
  };

  var getRiskName = function() {
    if (!_select) return InitialRiskName;

    var selected = _select.children.filter(function(child) { return child.selected; });
    if (selected && selected.length === 1) return selected[0].value;

    return InitialRiskName;
  };

  var getTotalDollars = function() {
    return _dollars + stockMarket.getStockDollars();
  }

  var syncSpans = function() {
    var stockValue = stockMarket.getStockDollars();
    if (_dollarsSpan) _dollarsSpan.innerText = _dollars.toUSDString(true);
    if (_stocksSpan) _stocksSpan.innerText = stockValue.toUSDString(true);
    if (_totalSpan) _totalSpan.innerText = (_dollars + stockValue).toUSDString(true);
  };

  var build = function() {
    if (!_columnDiv) return;

    var groupDiv = document.createFullElement("div", undefined, {className: "group"});
    _columnDiv.insertBefore(groupDiv, _columnDiv.firstChild); // This works even when firstChild is undefined

    var outlined = groupDiv.appendElement("div", undefined, {className: "outlined"});
    var titleRow = outlined.appendElement("div", undefined, {className: "row"});

    titleRow.appendElement("h3", undefined, {innerText: "Investments"});

    titleRow.appendText(" ");
    _select = titleRow.appendElement("select");

    RiskNames.forEach(function(name) {
      var option = _select.appendElement("option", undefined, {innerText: name});
      if (_riskName === name) option.selected = true;
    });

    var buttonColumn = outlined.appendElement("div", undefined, {className: "column"});

    buttonColumn
      .appendElement("div")
      .appendElement("input", undefined, {
        type: "button",
        value: "Deposit",
        onclick: function() {
          var transfer = Math.floor(accountant.getCents() / CentsPerDollar);
          if (!accountant.debitDollars(transfer)) {
            console.assert(false, "Cannot transfer - something bad happened debiting " + transfer);
            return;
          }
          _injectedDollars += transfer;
          _dollars += transfer;
          syncSpans();
        }
      });

    buttonColumn
      .appendElement("div")
      .appendElement("input", undefined, {
        type: "button",
        value: "Withdraw",
        onclick: function() {
          if (_dollars == 0) return;
          if (!accountant.creditDollars(_dollars)) {
            console.assert(false, "Cannot transfer - something bad happened crediting " + _dollars);
            return;
          }
          _injectedDollars -= _dollars;
          _dollars = 0;
          syncSpans();
        }
      });

    var stateColumn = outlined.appendElement("div", undefined, {className: "column small"});

    _dollarsSpan = stateColumn
      .appendElement("div", undefined, {innerText: "Cash: "})
      .appendElement("span");

    _stocksSpan = stateColumn
      .appendElement("div", undefined, {innerText: "Stocks: "})
      .appendElement("span");

    _totalSpan = stateColumn
      .appendElement("div", undefined, {className: "strong", innerText: "Total: "})
      .appendElement("span");

    stockMarket.bind(outlined);

    syncSpans();

    // TODO - Investment Engine Upgrade
  };

  setInterval(function() {
    if (stockMarket.getLength() >= stockMarket.getMaxLength() || Math.random() >= BuyFrequency || _dollars < MinimumReserve) return;

    _riskName = getRiskName();
    var riskLevel = riskMap[_riskName];
    var total = getTotalDollars();
    var budget = Math.ceil(total / riskLevel);
    var reserve = _riskName === HighRiskName ? 0 : Math.ceil(total / (11 - riskLevel));

    if ((_dollars - budget) < reserve) {
      if (_riskName === HighRiskName) {
        budget = _dollars > (total / 10) ? _dollars : 0;
      } else {
        budget = _dollars - reserve;
      }
    }

    if (budget < 1) return;

    // Buy
    var response = stockMarket.buyStock(budget, riskLevel);
    if (!response.stock) {
      console.assert(false, "The stock purchse failed ...");
      return;
    }
    _dollars -= response.stock.count * response.stock.originalPrice;
    syncSpans();
  }, BuyStockInterval);

  setInterval(function() {
    if (stockMarket.getLength() <= 0 ||  Math.random() > SellFrequency || _sellStockTime > new Date().getTime()) return;
    // Sell
    _dollars += stockMarket.sellStock();
    _sellStockTime = new Date().getTime() + InitialSellStockTimeout;
    syncSpans();
  }, SellStockInterval);

  stockMarket.addStockDollarsUpdatedCallback(syncSpans);

  /*
   * This will handle the case that the user has some time less than the InitialReportTimeout until the next report.
   */
  setTimeout(function() {
    appendReport();
    setInterval(appendReport, InitialReportTimeout);
  }, _reportTime - new Date().getTime());

  return {
    bind: function() {
      const DefaultThirdColumnDivId = "thirdColumnDiv";
      _columnDiv = document.getElementById(DefaultThirdColumnDivId);
      if (!_enabled) return;

      build();
    },
    enable: function() {
      _enabled = true;
      build();

      _reportTime = new Date().getTime() + InitialReportTimeout;
      setInterval(appendReport, InitialReportTimeout);
    },
    getTotalDollars: getTotalDollars,
    serialize: function() {
      return {
        dollars: _dollars,
        enabled: _enabled,
        injectedDollars: _injectedDollars,
        reportTimeout: _reportTime - new Date().getTime(),
        riskName: _riskName,
        sellStockTimeout: _sellStockTime - new Date().getTime()
      };
    }
  };
};
