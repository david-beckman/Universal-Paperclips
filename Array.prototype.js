Array.prototype.forEachCallback = function(value) {
  return this.forEach(function(callback) { callback(value); });
};
