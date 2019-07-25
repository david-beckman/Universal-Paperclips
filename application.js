(function() {
  const SaveName = "UniversalPaperclips"

  var accountant, clipFactory, clipMarketing, clipPricer, clipWarehouse, clipSeller, consoleAppender, milestoneTracker;

  var pendingSave = false;
  var save = function() {
    if (pendingSave) return;
    pendingSave = true;
    setTimeout(function() {
      if (!pendingSave) return;
      pendingSave = false;
      localStorage.setItem(SaveName, JSON.stringify({
        accountant: accountant.serialize(),
        clipFactory: clipFactory.serialize(),
        clipMarketing: clipMarketing.serialize(),
        clipPricer: clipPricer.serialize(),
        clipSeller: clipSeller.serialize(),
        clipWarehouse: clipWarehouse.serialize(),
        consoleAppender: consoleAppender.serialize(),
        milestoneTracker: milestoneTracker.serialize()
      }));
    }, 1);
  };

  var savedGame = JSON.parse(localStorage.getItem(SaveName) || "{}");

  (accountant = accountantFactory(savedGame.accountant)).bind(save);
  (clipFactory = clipFactoryFactory(savedGame.clipFactory)).bind(save);
  (clipMarketing = clipMarketingFactory(accountant, savedGame.clipMarketing)).bind(save);
  (clipPricer = clipPricerFactory(savedGame.clipPricer)).bind(save);
  (clipWarehouse = clipWarehouseFactory(clipFactory, savedGame.clipWarehouse)).bind(save);
  (clipSeller = clipSellerFactory(accountant, clipMarketing, clipPricer, clipWarehouse, savedGame.clipSeller)).bind(save);
  (consoleAppender = consoleAppenderFactory(savedGame.consoleAppender)).bind(save);
  (milestoneTracker = milestoneTrackerFactory(clipFactory, consoleAppender, savedGame.milestoneTracker)).bind(save);
})();
