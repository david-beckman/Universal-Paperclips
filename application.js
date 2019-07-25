(function() {
  const SaveName = "UniversalPaperclips"

  var clipFactory, consoleAppender, milestoneTracker;

  var pendingSave = false;
  var save = function() {
    if (pendingSave) return;
    pendingSave = true;
    setTimeout(function() {
      if (!pendingSave) return;
      pendingSave = false;
      localStorage.setItem(SaveName, JSON.stringify({
        clipFactory: clipFactory.serialize(),
        consoleAppender: consoleAppender.serialize(),
        milestoneTracker: milestoneTracker.serialize()
      }));
    }, 0);
  };

  var savedGame = JSON.parse(localStorage.getItem(SaveName) || "{}");

  (clipFactory = clipFactoryFactory(savedGame.clipFactory)).bind(save);
  (consoleAppender = consoleAppenderFactory(savedGame.consoleAppender)).bind(save);
  (milestoneTracker = milestoneTrackerFactory(clipFactory, consoleAppender, savedGame.milestoneTracker)).bind(save);
})();
