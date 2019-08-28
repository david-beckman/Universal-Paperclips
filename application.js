(function() {
  const SaveName = "UniversalPaperclips";
  const SaveInterval = 10e3; // 10s

  var accountant, autoclipperFactory, clipFactory, clipMarketing, clipPricer, clipSeller, clipWarehouse, computer, consoleAppender, cpu,
    creativityStorage, megaClipperFactory, milestoneTracker, operationsStorage, projectTracker, quantumComputer, stockMarket, stockTrader,
    trustWarehouse, wireMarket, wireSupplier;

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
      stockMarket: stockMarket.serialize(),
      stockTrader: stockTrader.serialize(),
      trustWarehouse: trustWarehouse.serialize(),
      wireMarket: wireMarket.serialize(),
      wireSupplier: wireSupplier.serialize()
    }));
  }, SaveInterval);

  var savedGame = JSON.parse(localStorage.getItem(SaveName) || "{}");

  // Level 0: No dependencies
  (accountant = accountantConstructor(savedGame.accountant)).bind();
  (clipPricer = clipPricerConstructor(savedGame.clipPricer)).bind();
  (consoleAppender = consoleAppenderConstructor(savedGame.consoleAppender)).bind();
  (stockMarket = stockMarketConstructor(savedGame.stockMarket)).bind();
  (trustWarehouse = trustWarehouseConstructor(savedGame.trustWarehouse)).bind();
  (wireSupplier = wireSupplierConstructor(savedGame.wireSupplier)).bind();

  // Level 1: Only level 0 dependencies
  (clipFactory = clipFactoryConstructor(wireSupplier, savedGame.clipFactory)).bind();
  (clipMarketing = clipMarketingConstructor(accountant, savedGame.clipMarketing)).bind();
  (stockTrader = stockTraderConstructor(accountant, consoleAppender, stockMarket, savedGame.stockTrader)).bind();
  (wireMarket = wireMarketConstructor(accountant, wireSupplier, savedGame.wireMarket)).bind();

  // Level 2: At least one level 1 dependency
  (autoclipperFactory = autoclipperFactoryConstructor(accountant, clipFactory, consoleAppender, savedGame.autoclipperFactory)).bind();
  (megaClipperFactory = megaClipperFactoryConstructor(accountant, clipFactory, savedGame.megaClipperFactory)).bind();
  (clipWarehouse = clipWarehouseConstructor(clipFactory, savedGame.clipWarehouse)).bind();
  (milestoneTracker = milestoneTrackerConstructor(clipFactory, consoleAppender, savedGame.milestoneTracker)).bind();

  // Level 3 ...
  (clipSeller = clipSellerConstructor(accountant, clipMarketing, clipPricer, clipWarehouse, savedGame.clipSeller)).bind();
  (cpu = cpuConstructor(trustWarehouse, savedGame.cpu)).bind();

  // Level 4 ...
  (operationsStorage = operationsStorageConstructor(cpu, savedGame.operationsStorage)).bind();

  // Level 5 ...
  (creativityStorage = creativityStorageConstructor(cpu, operationsStorage, savedGame.creativityStorage)).bind();
  (quantumComputer = quantumComputerConstructor(operationsStorage, savedGame.quantumComputer)).bind();

  // Level 6 ...
  (projectTracker = projectTrackerConstructor(accountant, autoclipperFactory, clipFactory, clipMarketing, clipSeller, clipWarehouse,
      consoleAppender, cpu, creativityStorage, megaClipperFactory, operationsStorage, quantumComputer, stockMarket, stockTrader,
      trustWarehouse, wireMarket, wireSupplier, savedGame.projectTracker))
    .bind();

  // Level 7 ...
  (computer = computerConstructor(consoleAppender, cpu, creativityStorage, milestoneTracker, operationsStorage, projectTracker,
      quantumComputer, trustWarehouse, savedGame.computer))
    .bind();
})();
