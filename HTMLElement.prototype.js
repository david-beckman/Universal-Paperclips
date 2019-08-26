HTMLElement.prototype.appendText = function(text) {
  return this.appendChild(this.ownerDocument.createTextNode(text));
};
