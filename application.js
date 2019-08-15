(function() {
  const SaveName = "UniversalPaperclips";

  var accountant, autoclipperFactory, clipFactory, clipMarketing, clipPricer, clipSeller, clipWarehouse, computer, consoleAppender, cpu,
    creativityStorage, megaClipperFactory, milestoneTracker, operationsStorage, projectTracker, trustWarehouse, wireMarket, wireSupplier;

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
        computer: computer.serialize(),
        consoleAppender: consoleAppender.serialize(),
        cpu: cpu.serialize(),
        creativityStorage: creativityStorage.serialize(),
        megaClipperFactory: megaClipperFactory.serialize(),
        milestoneTracker: milestoneTracker.serialize(),
        operationsStorage: operationsStorage.serialize(),
        projectTracker: projectTracker.serialize(),
        trustWarehouse: trustWarehouse.serialize(),
        wireMarket: wireMarket.serialize(),
        wireSupplier: wireSupplier.serialize()
      }));
    }, 10e3); // Only save every 10s (on the outside)
  };

  var savedGame = JSON.parse(localStorage.getItem(SaveName) || "{}");

  // Level 0: No dependencies
  (accountant = accountantFactory(savedGame.accountant)).bind(save);
  (clipPricer = clipPricerFactory(savedGame.clipPricer)).bind(save);
  (consoleAppender = consoleAppenderFactory(savedGame.consoleAppender)).bind(save);
  (trustWarehouse = trustWarehouseFactory(savedGame.trustWarehouse)).bind(save);
  (wireSupplier = wireSupplierFactory(savedGame.wireSupplier)).bind(save);

  // Level 1: Only level 0 dependencies
  (clipFactory = clipFactoryFactory(wireSupplier, savedGame.clipFactory)).bind(save);
  (clipMarketing = clipMarketingFactory(accountant, savedGame.clipMarketing)).bind(save);
  (wireMarket = wireMarketFactory(accountant, wireSupplier, savedGame.wireMarket)).bind(save);

  // Level 2: At least one level 1 dependency
  (autoclipperFactory = autoclipperFactoryFactory(accountant, clipFactory, consoleAppender, savedGame.autoclipperFactory)).bind(save);
  (megaClipperFactory = megaClipperFactoryFactory(accountant, clipFactory, savedGame.megaClipperFactory)).bind(save);
  (clipWarehouse = clipWarehouseFactory(clipFactory, savedGame.clipWarehouse)).bind(save);
  (milestoneTracker = milestoneTrackerFactory(clipFactory, consoleAppender, savedGame.milestoneTracker)).bind(save);

  // Level 3 ...
  (clipSeller = clipSellerFactory(accountant, clipMarketing, clipPricer, clipWarehouse, savedGame.clipSeller)).bind(save);
  (cpu = cpuFactory(trustWarehouse, savedGame.cpu)).bind(save);

  // Level 4 ...
  (operationsStorage = operationsStorageFactory(cpu, savedGame.operationsStorage)).bind(save);

  // Level 5 ...
  (creativityStorage = creativityStorageFactory(cpu, operationsStorage, savedGame.creativityStorage)).bind(save);

  // Level 6 ...
  (projectTracker = projectTrackerFactory(accountant, autoclipperFactory, clipSeller, clipWarehouse, consoleAppender, cpu, creativityStorage, megaClipperFactory, operationsStorage, trustWarehouse, wireMarket, wireSupplier, savedGame.projectTracker)).bind(save);

  // Level 7 ...
  (computer = computerFactory(consoleAppender, cpu, creativityStorage, milestoneTracker, operationsStorage, projectTracker, trustWarehouse, savedGame.computer)).bind(save);
})();
