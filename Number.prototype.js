Number.isPositiveInteger = function(value, errorMessage) {
  var response = Number.isInteger(value) && value > 0;
  if (errorMessage) console.assert(response, errorMessage + value);
  return response;
};

Number.prototype.toUSDString = function(hideCents) {
  var options = {style: "currency", currency: "USD"};
  if (hideCents) options.minimumFractionDigits = options.maximumFractionDigits = 0;

  return this.toLocaleString(undefined, options);
};
