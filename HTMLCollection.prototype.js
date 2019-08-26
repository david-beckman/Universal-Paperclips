HTMLCollection.prototype.forEach = function(action) {
  if (typeof (action) !== "function") return;

  for (var i=0; i<this.length; i++) {
    action(this[i]);
  }
};

HTMLCollection.prototype.filter = function(filter) {
  if (typeof(filter) !== "function") return;

  var response = [];
  this.forEach(function(node) { if (filter(node)) response.push(node); });
  return response;
};
