(function() {
  var clipFactory, consoleAppender;
  (clipFactory = clipFactoryFactory()).bind();
  (consoleAppender = consoleAppenderFactory()).bind();

  milestoneTrackerFactory(clipFactory, consoleAppender);
})();
