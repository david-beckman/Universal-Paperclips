Number.isPositiveInteger = function(value, errorMessage) {
  var response = Number.isInteger(value) && value > 0;
  if (errorMessage) console.assert(response, errorMessage + value);
  return response;
};

Number.prototype.toUSDString = function() {
  return this.toLocaleString(undefined, {style: "currency", currency: "USD"});
};
