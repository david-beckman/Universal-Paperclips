var stockMarketConstructor = function(initial) {
  const InitialGainRate = .5;
  const InitialStocks = [];

  const AdjustmentRate = .6;
  const AdjustStockInterval = 2500; // 2.5s
  const BounceBackRate = .24;
  const CharacterACode = 'A'.charCodeAt();
  const DeltaFactor = 1 / 4;
  const HeaderNames = ["Stock", "Amt.", "Price", "Total", "P/L"];
  const MaxStockCount = 1e6; // 1 Million
  const MaxStocks = 5;
  const StockNameLengthFrequency = [
    {frequency: .01, length: 1},
    {frequency: .1, length: 2},
    {frequency: .4, length: 3},
    {frequency: 1, length: 4}
  ];
  const StockPriceFrequency = [
    {frequency: .01, maxPrice: 3e3},
    {frequency: .15, maxPrice: 500},
    {frequency: .4, maxPrice: 150},
    {frequency: .8, maxPrice: 50},
    {frequency: 1, maxPrice: 15}
  ];

  var _gainRate = (initial && initial.gainRate) || InitialGainRate;
  var _stockDollarsUpdatedCallbacks = [];
  var _stocks = (initial && initial.stocks) || InitialStocks;

  var _stocksBody;

  var adjustPrice = function(stock) {
    if (Math.random() >= AdjustmentRate) return;

    var delta = Math.ceil(Math.random() * stock.currentPrice * DeltaFactor / stock.riskLevel);
    stock.currentPrice += (Math.random() <= _gainRate ? 1 : -1) * delta;
    if (stock.currentPrice <= 0 && Math.random() > BounceBackRate) {
      stock.currentPrice = 1;
    }
  };

  var build = function(parent) {
    var stockTable = parent.appendElement("table");

    var stockHeaderRow = stockTable
      .appendElement("thead", undefined, {className: "small"})
      .appendElement("tr");

    HeaderNames.forEach(function(name) {
      stockHeaderRow.appendElement("th", undefined, {innerText: name});
    });

    _stocksBody = stockTable.appendElement("tbody");

    syncTable();
  };

  var createCell = function(value, numeric) {
    var cell = document.createFullElement("td", undefined, {innerText: value.toLocaleString()});
    if (numeric) cell.className = "numeric";
    return cell;
  };

  var generateStock = function(budget, riskLevel) {
    var roll = Math.random();
    var price;

    for (var i=0; i<StockPriceFrequency.length; i++) {
      if (roll > StockPriceFrequency[i].frequency) continue;

      price = Math.max(1, Math.ceil(Math.random() * StockPriceFrequency[i].maxPrice));
      break;
    }

    // if can't afford, find one that we can:
    if (price > budget) price = Math.max(1, Math.ceil(Math.random() * budget));

    roll = Math.random();
    var symbol = '';

    for (var i=0; i<StockNameLengthFrequency.length; i++) {
      if (roll > StockNameLengthFrequency[i].frequency) continue;

      for (var j=0; j<StockNameLengthFrequency[i].length; j++) {
        symbol += String.fromCharCode(CharacterACode + Math.floor(Math.random() * 26));
      }
      break;
    }

    return {
      symbol,
      count: Math.min(MaxStockCount, Math.floor(budget / price)),
      originalPrice: price,
      currentPrice: price,
      riskLevel
    };
  };

  var getStockDollars = function() {
    return _stocks.map(function(stock) { return stock.count * stock.currentPrice; }).reduce(function(a, b) { return a + b; }, 0);
  };

  var syncTable = function() {
    if (!_stocksBody) return;

    while (_stocksBody.lastChild) _stocksBody.lastChild.remove();

    var i=0;

    for (; i<_stocks.length; i++) {
      var row = _stocksBody.appendElement("tr");

      row.appendChild(createCell(_stocks[i].symbol, false));
      row.appendChild(createCell(_stocks[i].count, true));
      row.appendChild(createCell(_stocks[i].currentPrice, true));
      row.appendChild(createCell(_stocks[i].count * _stocks[i].currentPrice, true));
      row.appendChild(createCell(_stocks[i].count * (_stocks[i].currentPrice - _stocks[i].originalPrice), true));
    }

    for (; i<MaxStocks; i++) {
      var row = _stocksBody.appendElement("tr");
      for (var j=0; j<HeaderNames.length; j++) {
        row.appendElement("td", undefined, {innerHTML: "&nbsp;"});
      }
    }
  };

  setInterval(function() {
    // adjust price
    _stocks.forEach(adjustPrice);
    syncTable();
    _stockDollarsUpdatedCallbacks.forEachCallback(getStockDollars());
  }, AdjustStockInterval);

  return {
    addStockDollarsUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _stockDollarsUpdatedCallbacks.push(callback);
    },
    bind: function(parentNode) {
      if (!parentNode) return;

      build(parentNode);
    },
    buyStock: function(dollars, riskLevel) {
      if (!Number.isPositiveInteger(dollars) || _stocks.length > MaxStocks) return { stock: null, remainingDollars: dollars };

      var stock = _stocks[_stocks.length] = generateStock(dollars, riskLevel);

      syncTable();
      _stockDollarsUpdatedCallbacks.forEachCallback(getStockDollars());

      return { stock, remainingDollars: dollars - stock.count * stock.currentPrice };
    },
    getLength: function() {
      return _stocks.length;
    },
    getMaxLength: function() {
      return MaxStocks;
    },
    getStockDollars: getStockDollars,
    incrementGain: function() {
      _gainRate++;
    },
    sellStock: function() {
      if (_stocks.length < 1) {
        console.assert(false, "No stocks to sell.");
        return 0;
      }
      var amount = _stocks[0].count * _stocks[0].currentPrice;
      _stocks.splice(0, 1);
      _stockDollarsUpdatedCallbacks.forEachCallback(getStockDollars());
      return amount;
    },
    serialize: function() {
      return {
        gainRate: _gainRate,
        stocks: _stocks
      };
    }
  };
};
