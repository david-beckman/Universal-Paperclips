(function() {
  const SaveName = "UniversalPaperclips"

  var accountant, clipFactory, clipMarketing, clipPricer, clipWarehouse, clipSeller, consoleAppender, milestoneTracker, wireMarket, wireSupplier;

  var pendingSave = false;
  var save = function() {
    if (pendingSave) return;
    pendingSave = true;
    setTimeout(function() {
      if (!pendingSave) return;
      pendingSave = false;
      localStorage.setItem(SaveName, JSON.stringify({
        accountant: accountant.serialize(),
        autoclipperFactory: autoclipperFactory.serialize(),
        clipFactory: clipFactory.serialize(),
        clipMarketing: clipMarketing.serialize(),
        clipPricer: clipPricer.serialize(),
        clipSeller: clipSeller.serialize(),
        clipWarehouse: clipWarehouse.serialize(),
        consoleAppender: consoleAppender.serialize(),
        milestoneTracker: milestoneTracker.serialize(),
        wireMarket: wireMarket.serialize(),
        wireSupplier: wireSupplier.serialize()
      }));
    }, 10000); // Only save every 10s (on the outside)
  };

  var savedGame = JSON.parse(localStorage.getItem(SaveName) || "{}");

  // Level 0: No dependencies
  (accountant = accountantFactory(savedGame.accountant)).bind(save);
  (clipPricer = clipPricerFactory(savedGame.clipPricer)).bind(save);
  (consoleAppender = consoleAppenderFactory(savedGame.consoleAppender)).bind(save);
  (wireSupplier = wireSupplierFactory(savedGame.wireSupplier)).bind(save);

  // Level 1: Only level 0 dependencies
  (clipMarketing = clipMarketingFactory(accountant, savedGame.clipMarketing)).bind(save);
  (clipFactory = clipFactoryFactory(wireSupplier, savedGame.clipFactory)).bind(save);
  (wireMarket = wireMarketFactory(accountant, wireSupplier, savedGame.wireMarket)).bind(save);

  // Level 2: At least one level 1 dependency
  (autoclipperFactory = autoclipperFactoryFactory(accountant, clipFactory, consoleAppender, savedGame.autoclipperFactory)).bind(save);
  (clipWarehouse = clipWarehouseFactory(clipFactory, savedGame.clipWarehouse)).bind(save);
  (milestoneTracker = milestoneTrackerFactory(clipFactory, consoleAppender, savedGame.milestoneTracker)).bind(save);

  // Level 3 ...
  (clipSeller = clipSellerFactory(accountant, clipMarketing, clipPricer, clipWarehouse, savedGame.clipSeller)).bind(save);
})();
