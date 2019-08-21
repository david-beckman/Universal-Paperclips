(function() {
  const SaveName = "UniversalPaperclips";
  const SaveInterval = 10e3; // 10s

  var accountant, autoclipperFactory, clipFactory, clipMarketing, clipPricer, clipSeller, clipWarehouse, computer, consoleAppender, cpu,
    creativityStorage, megaClipperFactory, milestoneTracker, operationsStorage, projectTracker, quantumComputer, trustWarehouse, wireMarket, wireSupplier;

  setInterval(function() {
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
      quantumComputer: quantumComputer.serialize(),
      trustWarehouse: trustWarehouse.serialize(),
      wireMarket: wireMarket.serialize(),
      wireSupplier: wireSupplier.serialize()
    }));
  }, SaveInterval);

  var savedGame = JSON.parse(localStorage.getItem(SaveName) || "{}");

  // Level 0: No dependencies
  (accountant = accountantFactory(savedGame.accountant)).bind();
  (clipPricer = clipPricerFactory(savedGame.clipPricer)).bind();
  (consoleAppender = consoleAppenderFactory(savedGame.consoleAppender)).bind();
  (trustWarehouse = trustWarehouseFactory(savedGame.trustWarehouse)).bind();
  (wireSupplier = wireSupplierFactory(savedGame.wireSupplier)).bind();

  // Level 1: Only level 0 dependencies
  (clipFactory = clipFactoryFactory(wireSupplier, savedGame.clipFactory)).bind();
  (clipMarketing = clipMarketingFactory(accountant, savedGame.clipMarketing)).bind();
  (wireMarket = wireMarketFactory(accountant, wireSupplier, savedGame.wireMarket)).bind();

  // Level 2: At least one level 1 dependency
  (autoclipperFactory = autoclipperFactoryFactory(accountant, clipFactory, consoleAppender, savedGame.autoclipperFactory)).bind();
  (megaClipperFactory = megaClipperFactoryFactory(accountant, clipFactory, savedGame.megaClipperFactory)).bind();
  (clipWarehouse = clipWarehouseFactory(clipFactory, savedGame.clipWarehouse)).bind();
  (milestoneTracker = milestoneTrackerFactory(clipFactory, consoleAppender, savedGame.milestoneTracker)).bind();

  // Level 3 ...
  (clipSeller = clipSellerFactory(accountant, clipMarketing, clipPricer, clipWarehouse, savedGame.clipSeller)).bind();
  (cpu = cpuFactory(trustWarehouse, savedGame.cpu)).bind();

  // Level 4 ...
  (operationsStorage = operationsStorageFactory(cpu, savedGame.operationsStorage)).bind();

  // Level 5 ...
  (creativityStorage = creativityStorageFactory(cpu, operationsStorage, savedGame.creativityStorage)).bind();
  (quantumComputer = quantumComputerFactory(operationsStorage, savedGame.quantumComputer)).bind();

  // Level 6 ...
  (projectTracker = projectTrackerFactory(accountant, autoclipperFactory, clipMarketing, clipSeller, clipWarehouse, consoleAppender, cpu,
      creativityStorage, megaClipperFactory, operationsStorage, quantumComputer, trustWarehouse, wireMarket, wireSupplier,
      savedGame.projectTracker))
    .bind();

  // Level 7 ...
  (computer = computerFactory(consoleAppender, cpu, creativityStorage, milestoneTracker, operationsStorage, projectTracker, quantumComputer,
      trustWarehouse, savedGame.computer))
    .bind();
})();
