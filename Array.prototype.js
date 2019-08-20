Array.prototype.forEachCallback = function(value, enableTimeout) {
  return this.forEach(function(callback) {
    if (!enableTimeout) callback(value);
    else {
      /*
       * Though not obvious, the need for pushing the method on the stack can be expressed in the wire buyer:
       * - If the wire buyer is ready to purchase, it will debit the accountant
       * - Because the accountant is debited, all of it's triggers will be activated
       * - The wire buyer is then re-triggered before actually buying wire
       */
      setTimeout(function() { callback(value); }, 0);
    }
  });
};
