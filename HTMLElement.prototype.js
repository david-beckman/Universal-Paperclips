HTMLElement.prototype.appendText = function(text) {
  return this.appendChild(this.ownerDocument.createTextNode(text));
};

HTMLElement.prototype.appendElement = function(tagName, options, attributeList) {
  return this.appendChild(this.ownerDocument.createFullElement(tagName, options, attributeList));
};
