HTMLDocument.prototype.createFullElement = function(tagName, options, attributeList) {
  var element = this.createElement(tagName, options);

  if (attributeList) Object.keys(attributeList).forEach(function(key) {
    element[key] = attributeList[key];
  });

  return element;
};
