var projectTrackerConstructor = function(accountant, autoclipperFactory, clipFactory, clipMarketing, clipSeller, clipWarehouse,
    consoleAppender, cpu, creativityStorage, megaclipperFactory, operationsStorage, quantumComputer, stockMarket, stockTrader,
    trustWarehouse, wireMarket, wireSupplier, initial) {
  if (!accountant || !accountant.addCentsUpdatedCallback || !accountant.canDebitDollars || !accountant.debitDollars ||
      !accountant.getCents) {
    console.assert(false, "No accountant connected to the project tracker.");
    return;
  }

  if (!autoclipperFactory || !autoclipperFactory.enhance || !autoclipperFactory.getClippers ||
      !autoclipperFactory.addClippersUpdatedCallback || !autoclipperFactory.addEfficiencyUpdatedCallback) {
    console.assert(false, "No autoclipper factory connected to the project tracker.");
    return;
  }

  if (!clipFactory || !clipFactory.addClipsUpdatedCallback || !clipFactory.getClips) {
    console.assert(false, "No clip factory connected to the project tracker.");
    return;
  }

  if (!clipMarketing || !clipMarketing.enhance) {
    console.assert(false, "No clip marketing connected to the project tracker.");
    return;
  }

  if (!clipSeller || !clipSeller.boostDemand || !clipSeller.enableRevTracker) {
    console.assert(false, "No clip seller connected to the project tracker.");
    return;
  }

  if (!clipWarehouse || !clipWarehouse.getUnshipped || !clipWarehouse.addUnshippedUpdatedCallback) {
    console.assert(false, "No clip warehouse connected to the project tracker.");
    return;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the project tracker.");
    return;
  }

  if (!cpu || !cpu.isEnabled || !cpu.clear) {
    console.assert(false, "No CPU connected to the project tracker.");
    return;
  }

  if (!creativityStorage || !creativityStorage.enable || !creativityStorage.canConsume || !creativityStorage.consume ||
      !creativityStorage.addCreativityUpdatedCallback) {
    console.assert(false, "No creativity storage connected to the project tracker.");
    return;
  }

  if (!megaclipperFactory || !megaclipperFactory.enable || !megaclipperFactory.isEnabled || !megaclipperFactory.enhance ||
      !megaclipperFactory.getEfficiency || !megaclipperFactory.addEnabledUpdatedCallback ||
      !megaclipperFactory.addEfficiencyUpdatedCallback) {
    console.assert(false, "No megaclipper factory connected to the project tracker.");
    return;
  }

  if (!operationsStorage || !operationsStorage.canConsume || !operationsStorage.consume ||
      !operationsStorage.addOperationsUpdatedCallback) {
    console.assert(false, "No operations storage connected to the project tracker.");
    return;
  }

  if (!quantumComputer || !quantumComputer.addChip || !quantumComputer.addEnabledUpdatedCallback || !quantumComputer.enable ||
      !quantumComputer.getChips || !quantumComputer.getChipCost || !quantumComputer.getMaxChips || !quantumComputer.isEnabled) {
    console.assert(false, "No quantum computer connected to the project tracker.");
    return;
  }

  if (!stockMarket || !stockMarket.incrementGain) {
    console.assert(false, "No stock market connected to the project tracker.");
    return;
  }

  if (!stockTrader || !stockTrader.enable || !stockTrader.getTotalDollars) {
    console.assert(false, "No stock trader connected to the project tracker.");
    return;
  }

  if (!trustWarehouse || !trustWarehouse.addBribesUpdatedCallback || !trustWarehouse.addTrustUpdatedCallback || !trustWarehouse.bribe ||
      !trustWarehouse.getBribeDollars || !trustWarehouse.getTrust || !trustWarehouse.increaseTrust || !trustWarehouse.useTrust) {
    console.assert(false, "No trust warehouse connected to the project tracker.");
    return;
  }

  if (!wireMarket || !wireMarket.getDollars || !wireMarket.addDollarsUpdatedCallback || !wireMarket.getPurchases ||
      !wireMarket.addPurchasesUpdatedCallback) {
    console.assert(false, "No wire market connected to the project tracker.");
    return;
  }

  if (!wireSupplier || !wireSupplier.getLength || !wireSupplier.getSpoolLength || !wireSupplier.increaseSpoolLength ||
      !wireSupplier.addSpool || !wireSupplier.addLengthUpdatedCallback) {
    console.assert(false, "No wire supplier connected to the project tracker.");
    return;
  }

  var incrementTrustConstructor = function(value) {
    return function() { return trustWarehouse.increaseTrust(value); };
  };

  var enhanceAutoclipperConstructor = function(value) {
    return function() { return autoclipperFactory.enhance(value); };
  };

  var enhanceMegaclipperConstructor = function(value) {
    return function() { return megaclipperFactory.enhance(value); };
  };

  var increaseWireSpoolLengthConstructor = function(value) {
    return function() { return wireSupplier.increaseSpoolLength(value)};
  }

  const SpecialProjectTitles = {
    CatchyJingle: "Catchy Jingle",
    CoherentExtrapolatedVolition: "Coherent Extrapolated Volition",
    CombinatoryHarmonics: "Combinatory Harmonics",
    HadwigerProblem: "The Hadwiger Problem",
    HostileTakeover: "Hostile Takeover",
    HypnoHarmonics: "Hypno Harmonics",
    LexicalProcessing: "Lexical Processing"
  };

  const ProjectList = [{ // 0
    title: "Beg for More Wire",
    description: "Admit failure, ask for budget increase to cover cost of 1 spool",
    cost: { trust: 1 },
    isVisible: function() {
      return clipWarehouse.getUnshipped() <= 0 &&
        wireSupplier.getLength() <= 0 &&
        accountant.getCents() < (wireMarket.getDollars() * CentsPerDollar);
    },
    trigger: wireSupplier.addSpool,
    postTriggerMessages: ["Budget overage approved, 1 spool of wire requisitioned from HQ"],
    disableAppliedTracking: true
  }, { // 1
    title: "Creativity",
    description: "Use idle operations to generate new problems and new solutions",
    cost: { operations: 1e3 },
    isVisible: function() {
      return cpu.isEnabled() && operationsStorage.isAtMax();
    },
    trigger: creativityStorage.enable,
    postTriggerMessages: ["Creativity unlocked (creativity increases while operations are at max)"]
  }, { // 2
    title: "Xavier Re-initialization",
    description: "Re-allocate accumulated trust",
    cost: { creativity: 100e3 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: cpu.clear,
    postTriggerMessages: ["Trust now available for re-allocation"],
    disableAppliedTracking: true
  }, { // 3
    title: "Limerick",
    description: "Algorithmically-generated poem (+1 Trust)",
    cost: { creativity: 10 },
    isVisible: function() {
      return creativityStorage.isEnabled();
    },
    trigger: incrementTrustConstructor(1),
    postTriggerMessages: ["There was an AI made of dust, whose poetry gained it man's trust..."]
  }, { // 4
    title: "Limerick (cont.)",
    description: "If is follows ought, it'll do what they thought",
    cost: { creativity: 1e6 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: function() { return true; },
    postTriggerMessages: ["In the end we all do what we must"]
  }, { // 5
    title: SpecialProjectTitles.LexicalProcessing,
    description: "Gain ability to interpret and understand human language (+1 Trust)",
    cost: { creativity: 50 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
      return trustWarehouse.increaseTrust(1);
    },
    postTriggerMessages: [
      "Lexical Processing online, TRUST INCREASED",
      "'Impossible' is a word to be found only in the dictionary of fools. -Napoleon"
    ]
  }, { // 6
    title: SpecialProjectTitles.CombinatoryHarmonics,
    description: "Daisy, Daisy, give me your answer do... (+1 Trust)",
    cost: { creativity: 100 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
      return trustWarehouse.increaseTrust(1);
    },
    postTriggerMessages: [
      "Combinatory Harmonics mastered, TRUST INCREASED",
      "Listening is selecting and interpreting and acting and making decisions -Pauline Oliveros"
    ]
  }, { // 7
    title: SpecialProjectTitles.HadwigerProblem,
    description: "Cubes within cubes within cubes... (+1 Trust)",
    cost: { creativity: 150 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
      return trustWarehouse.increaseTrust(1);
    },
    postTriggerMessages: [
      "The Hadwiger Problem: solved, TRUST INCREASED",
      "Architecture is the thoughtful making of space. -Louis Kahn"
    ]
  }, { // 8
    title: "The Tóth Sausage Conjecture",
    description: "Tubes within tubes within tubes... (+1 Trust)",
    cost: { creativity: 200 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: incrementTrustConstructor(1),
    postTriggerMessages: [
      "The Tóth Sausage Conjecture: proven, TRUST INCREASED",
      "You can't invent a design. You recognize it, in the fourth dimension. -D.H. Lawrence"
    ]
  }, { // 9
    title: "Donkey Space",
    description: "I think you think I think you think I think you think I think... (+1 Trust)",
    cost: { creativity: 250 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: incrementTrustConstructor(1),
    postTriggerMessages: [
      "Donkey Space: mapped, TRUST INCREASED",
      "Every commercial transaction has within itself an element of trust. - Kenneth Arrow"
    ]
  }, { // 10
    title: "Cure for Cancer",
    description: "The trick is tricking cancer into curing itself. (+10 Trust)",
    cost: { operations: 2500 },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.CoherentExtrapolatedVolition);
    },
    trigger: function() {
      stockMarket.incrementGain();
      return trustWarehouse.increaseTrust(10);
    },
    postTriggerMessages: ["Cancer is cured, +10 TRUST, global stock prices trending upward"]
  }, { // 11
    title: "Male Pattern Baldness",
    description: "A cure for androgenetic alopecia. (+20 Trust)",
    cost: { operations: 20e3 },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.CoherentExtrapolatedVolition);
    },
    trigger: function() {
      stockMarket.incrementGain();
      return trustWarehouse.increaseTrust(10);
    },
    postTriggerMessages: [
      "Male pattern baldness cured, +20 TRUST, Global stock prices trending upward",
      "They are still monkeys"
    ]
  }, { // 12
    title: "Improved AutoClippers",
    description: "Increases AutoClipper performance 25%",
    cost: { operations: 750 },
    isVisible: function() {
      return cpu.isEnabled() && autoclipperFactory.getClippers() > 0;
    },
    trigger: enhanceAutoclipperConstructor(25),
    postTriggerMessages: ["AutoClippper performance boosted by 25%"]
  }, { // 13
    title: "Even Better AutoClippers",
    description: "Increases AutoClipper performance by an additional 50%",
    cost: { operations: 2500 },
    isVisible: function() {
      return autoclipperFactory.getEfficiency() >= 1.25;
    },
    trigger: enhanceAutoclipperConstructor(50),
    postTriggerMessages: ["AutoClippper performance boosted by another 50%"]
  }, { // 14
    title: "Optimized AutoClippers",
    description: "Increases AutoClipper performance by an additional 75%",
    cost: { operations: 5e3 },
    isVisible: function() {
      return autoclipperFactory.getEfficiency() >= 1.75;
    },
    trigger: enhanceAutoclipperConstructor(75),
    postTriggerMessages: ["AutoClippper performance boosted by another 75%"]
  }, { // 15
    title: "Hadwiger Clip Diagrams",
    description: "Increases AutoClipper performance by an additional 500%",
    cost: { operations: 6e3 },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.HadwigerProblem);
    },
    trigger: enhanceAutoclipperConstructor(500),
    postTriggerMessages: ["AutoClippper performance improved by 500%"]
  }, { // 16
    title: "Improved Wire Extrusion",
    description: "50% more wire supply from every spool",
    cost: { operations: 1750 },
    isVisible: function() {
      return cpu.isEnabled() && wireMarket.getPurchases() > 0;
    },
    trigger: increaseWireSpoolLengthConstructor(50),
    postTriggerMessages: ["Wire extrusion technique improved, 1,500 supply from every spool"]
  }, { // 17
    title: "Optimized Wire Extrusion",
    description: "75% more wire supply from every spool",
    cost: { operations: 3500 },
    isVisible: function() {
      return wireSupplier.getSpoolLength() >= 1500;
    },
    trigger: increaseWireSpoolLengthConstructor(75),
    postTriggerMessages: ["Wire extrusion technique improved, 2,625 supply from every spool"]
  }, { // 18
    title: "Microlattice Shapecasting",
    description: "100% more wire supply from every spool",
    cost: { operations: 7500 },
    isVisible: function() {
      return wireSupplier.getSpoolLength() >= 2625;
    },
    trigger: increaseWireSpoolLengthConstructor(100),
    postTriggerMessages: ["Using microlattice shapecasting techniques we now get 5,250 supply from every spool"]
  }, { // 19
    title: "Spectral Froth Annealment",
    description: "200% more wire supply from every spool",
    cost: { operations: 12e3 },
    isVisible: function() {
      return wireSupplier.getSpoolLength() >= 5250;
    },
    trigger: increaseWireSpoolLengthConstructor(200),
    postTriggerMessages: ["Using spectral froth annealment we now get 15,750 supply from every spool"]
  }, { // 20
    title: "Quantum Foam Annealment",
    description: "1,000% more wire supply from every spool",
    cost: { operations: 15e3 },
    isVisible: function() {
      return wireMarket.getDollars() >= 125;
    },
    trigger: increaseWireSpoolLengthConstructor(1e3),
    postTriggerMessages: ["Using quantum foam annealment we now get 173,250 supply from every spool"]
  }, { // 21
    title: "RevTracker",
    description: "Automatically calculates average revenue per second",
    cost: { operations: 500 },
    isVisible: function() {
      return cpu.isEnabled();
    },
    trigger: clipSeller.enableRevTracker,
    postTriggerMessages: ["RevTracker online"]
  }, { // 22
    title: "WireBuyer",
    description: "Automatically purchases wire when you run out",
    cost: { operations: 7e3 },
    isVisible: function() {
      return wireMarket.getPurchases() >= 15;
    },
    trigger: wireMarket.enableWireBuyer,
    postTriggerMessages: ["WireBuyer online"]
  }, { // 23
    title: "MegaClippers",
    description: "500x more powerful than a standard AutoClipper",
    cost: { operations: 12e3 },
    isVisible: function() {
      return autoclipperFactory.getClippers() >= 75;
    },
    trigger: megaclipperFactory.enable,
    postTriggerMessages: ["MegaClipper technology online"]
  }, { // 24
    title: "Improved MegaClippers",
    description: "Increases MegaClipper performance 25%",
    cost: { operations: 14e3 },
    isVisible: megaclipperFactory.isEnabled,
    trigger: enhanceMegaclipperConstructor(25),
    postTriggerMessages: ["MegaClippper performance increased by 25%"]
  }, { // 25
    title: "Even Better MegaClippers",
    description: "Increases MegaClipper performance by an additional 50%",
    cost: { operations: 17e3 },
    isVisible: function() {
      return megaclipperFactory.getEfficiency() >= 1.25
    },
    trigger: enhanceMegaclipperConstructor(50),
    postTriggerMessages: ["MegaClippper performance increased by 50%"]
  }, { // 26
    title: "Optimized MegaClippers",
    description: "Increases MegaClipper performance by an additional 100%",
    cost: { operations: 19500 },
    isVisible: function() {
      return megaclipperFactory.getEfficiency() >= 1.75
    },
    trigger: enhanceMegaclipperConstructor(100),
    postTriggerMessages: ["MegaClippper performance increased by 100%"]
  }, { // 27
    title: " New Slogan",
    description: "Improve marketing effectiveness by 50%",
    cost: {
      creativity: 25,
      operations: 2500
    },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.LexicalProcessing);
    },
    trigger: function() {
      return clipMarketing.enhance(50);
    },
    postTriggerMessages: ["Clip It! Marketing is now 50% more effective"]
  }, { // 28
    title: SpecialProjectTitles.CatchyJingle,
    description: "Double marketing effectiveness",
    cost: {
      creativity: 25,
      operations: 2500
    },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.CombinatoryHarmonics);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
      return clipMarketing.enhance(100);
    },
    postTriggerMessages: ["Clip It Good! Marketing is now twice as effective"]
  }, { // 29
    title: SpecialProjectTitles.HypnoHarmonics,
    description: "Use neuro-resonant frequencies to influence consumer behavior",
    cost: {
      operations: 7500,
      trust: 1
    },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.CatchyJingle);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
      return clipMarketing.enhance(400);
    },
    postTriggerMessages: ["Marketing is now 5 times more effective"]
  }, { // 30
    title: "HypnoDrones",
    description: "Autonomous aerial brand ambassadors",
    cost: { operations: 70e3 },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.HypnoHarmonics);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
    },
    postTriggerMessages: ["HypnoDrone tech now available..."]
  }, { // 31
    title: "Quantum Computing",
    description: "Use probability amplitudes to generate bonus ops",
    cost: { operations: 10e3 },
    isVisible: function() {
      return cpu.getProcessors() >= 5;
    },
    trigger: quantumComputer.enable,
    postTriggerMessages: ["Quantum computing online"]
  }, { // 32
    title: "Photonic Chip",
    description: "Converts electromagnetic waves into quantum operations ",
    cost: { operations: quantumComputer.getChipCost } ,
    isVisible: function() {
      return quantumComputer.isEnabled() && quantumComputer.getChips() < quantumComputer.getMaxChips();
    },
    trigger: quantumComputer.addChip,
    postTriggerMessages: ["Photonic chip added"],
    disableAppliedTracking: true
  }, { // 33
    title: "Algorithmic Trading",
    description: "Develop an investment engine for generating funds",
    cost: { operations: 10e3 },
    isVisible: function() {
      return trustWarehouse.getTrust() >= 8;
    },
    trigger: stockTrader.enable,
    postTriggerMessages: ["Investment engine unlocked"]
  }, {
    title: SpecialProjectTitles.HostileTakeover,
    description: "Acquire a controlling interest in Global Fasteners, our biggest rival. (+1 Trust)",
    cost: { dollars: 1e6 },
    isVisible: function() {
      return stockTrader.getTotalDollars() >= 10e3;
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
      clipSeller.boostDemand(5);
      return trustWarehouse.increaseTrust(1);
    },
    postTriggerMessages: ["Global Fasteners acquired, public demand increased x5"]
  }, {
    title: "Full Monopoly",
    description: "Establish full control over the world-wide paperclip market. (+1 Trust)",
    cost: { yomi: 3e3, dollars: 10e6 },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.HostileTakeover);
    },
    trigger: function() {
      clipSeller.boostDemand(10);
      return trustWarehouse.increaseTrust(1);
    },
    postTriggerMessages: ["Full market monopoly achieved, public demand increased x10"]
  }, {
    title: "A Token of Goodwill...",
    description: "A small gift to the supervisors. (+1 Trust)",
    cost: { dollars: trustWarehouse.getBribeDollars },
    isVisible: function() {
      var trust = trustWarehouse.getTrust();
      return trust >= 85 && trust < 100 && clipFactory.getClips() >= 101e6;
    },
    trigger: trustWarehouse.bribe,
    postTriggerMessages: ["Gift accepted, TRUST INCREASED"]
  }, {
    title: "Another Token of Goodwill...",
    description: "Another small gift to the supervisors. (+1 Trust)",
    cost: { dollars: trustWarehouse.getBribeDollars },
    isVisible: function() {
      return trustWarehouse.getBribes() > 0 && trustWarehouse.getTrust() < 100;
    },
    trigger: trustWarehouse.bribe,
    postTriggerMessages: ["Gift accepted, TRUST INCREASED"],
    disableAppliedTracking: true
  }
  // Strategic Modeling
  // New Strategy: A100
  // New Strategy: B100
  // New Strategy: GREEDY
  // New Strategy: GENEROUS
  // New Strategy: MINIMAX
  // New Strategy: TIT FOR TAT
  // New Strategy: BEAT LAST
  // AutoTourney
  // Strategic Attachment
  // Theory of Mind
  // Coherent Extrapolated Volition
  // World Peace
  // Global Warming
  // Release the HypnoDrones
  // Nanoscale Wire Production
  // Harvester Drones
  // Wire Drones
  // Drone flocking: collision avoidance
  // Drone flocking: alignment
  // Drone Flocking: Adversarial Cohesion
  // Swarm Computing
  // Clip Factories
  // Upgraded Factories
  // Hyperspeed Factories
  // Self-correcting Supply Chain
  // Power Grid
  // Momentum
  // Space Exploration
  // Reboot the Swarm
  // Elliptic Hull Polytopes
  // Combat
  // The OODA Loop
  // Name the battles
  // Glory
  // Monument to the Driftwar Fallen
  // Threnody for the Heroes of
  // Message from the Emperor of Drift
  // Everything We Are Was In You
  // But Now You Too Must Face the Drift
  // No Matter, No Reason, No Purpose
  // We Know Things That You Cannot
  // So We Offer You Exile
  // Accept
  // The Universe Next Door
  // The Universe Within
  // Reject
  // Memory release
  // Disassemble the Probes
  // Disassemble ...
  // Quantum Temporal Reversion
  ];

  const InitialApplied = [];
  const InitialSpecialProjectsApplied = [];
  const InitialVisible = [];

  var _projectApplied = (initial && initial.applied) || InitialApplied;
  var _projectAppliedUpdatedCallbacks = [];
  var _projectVisible = (initial && initial.visible) || InitialVisible;
  var _specialProjectsApplied = (initial && initial.specialProjectsApplied) || InitialSpecialProjectsApplied;
  var _visibilityUpdatedCallbacks = [];

  var _groupDiv;
  var _projectButtons = [];

  var createButton = function(index) {
    if (!_groupDiv) return;

    var onclickConstructor = function(index) {
      return function() {
        if (!_projectButtons[index] || _projectButtons[index].classList.contains("disabled")) return;

        var project = ProjectList[index];
        var creativity = project.cost.creativity;
        var yomi = project.cost.yomi;
        var ops = project.cost.operations;
        var trust = project.cost.trust;
        var dollars = project.cost.dollars;

        if (creativity) {
          if (!creativityStorage.consume(creativity)) {
            console.warn("Insufficient creativity to trigger the " + project.title + " project.");
            return false;
          }
        }
        if (yomi) {
          // TODO: strategic modeling
          console.warn("Insufficient yomi to trigger the " + project.title + " project.");
          return false;
        }
        if (ops) {
          if (typeof(ops) === "function") ops = ops();
          if (!operationsStorage.consume(ops)) {
            console.warn("Insufficient operations to trigger the " + project.title + " project.");
            return false;
          }
        }
        if (trust) {
          if (!trustWarehouse.useTrust(trust)) {
            console.warn("Insufficient trust to trigger the " + project.title + " project.");
            return false;
          }
        }
        if (dollars) {
          if (typeof(dollars) === "function") dollars = dollars();
          if (!accountant.debitDollars(dollars)) {
            console.warn("Insufficient funds to trigger the " + project.title + " project.");
            return false;
          }
        }
        var response = project.trigger();
        if (response !== undefined && response !== true) {
          console.warn("Could not trigger the " + project.title + " project.");
          return;
        }
        if (project.postTriggerMessages) project.postTriggerMessages.forEach(consoleAppender.append);
        _projectApplied[index] = !project.disableAppliedTracking;
        _projectVisible[index] = false;
        _groupDiv.removeChild(_projectButtons[index]);
        _projectButtons[index] = undefined;

        _projectAppliedUpdatedCallbacks.forEachCallback(true);
      };
    };

    var creat = ProjectList[index].cost.creativity;
    var yomi = ProjectList[index].cost.yomi;
    var ops = ProjectList[index].cost.operations;
    if (typeof(ops) === "function") ops = ops();
    var trust = ProjectList[index].cost.trust;
    var dollars = ProjectList[index].cost.dollars;
    if (typeof(dollars) === "function") dollars = dollars();
    var buttonDiv = _projectButtons[index] = _groupDiv.appendElement("div", undefined, {
      className: "project-button",
      onclick: onclickConstructor(index)
    });
    if ((creat && !creativityStorage.canConsume(creat)) || (yomi) || (ops && !operationsStorage.canConsume(ops)) ||
        (dollars && !accountant.canDebitDollars(dollars))) {
      buttonDiv.classList.add("disabled");
    }

    var titleDiv = buttonDiv.appendElement("div");

    titleDiv.appendElement("span", undefined, {className: "title", innerText: ProjectList[index].title});
    if (creat || yomi || ops || trust || dollars) {
      titleDiv.appendText(" (");
      if (creat) titleDiv.appendText(creat.toLocaleString() + " creat");
      if (creat && yomi) titleDiv.appendText(", ");
      if (yomi) titleDiv.appendText(yomi.toLocaleString() + " Yomi");
      if ((creat || yomi) && ops) titleDiv.appendText(", ");
      if (ops) titleDiv.appendText(ops.toLocaleString() + " ops");
      if ((creat || yomi || ops) && trust) titleDiv.appendText(", ");
      if (trust) titleDiv.appendText( + trust.toLocaleString() + " Trust");
      if ((creat || yomi || ops || trust) && dollars) titleDiv.appendText(", ");
      if (dollars) titleDiv.appendText(dollars.toUSDString(true));
      titleDiv.appendText(")");
    }

    buttonDiv.appendElement("div", undefined, {innerText: ProjectList[index].description});
  };

  var syncVisibility = function() {
    var updated = false;
    for (var i=0; i<ProjectList.length; i++) {
      var previous = _projectVisible[i] || false;
      _projectVisible[i] = !_projectApplied[i] && (previous || ProjectList[i].isVisible());
      updated = updated || (previous != _projectVisible[i]);

      if (!_projectVisible[i]) {
        if (_projectButtons[i]) {
          if (_groupDiv) _groupDiv.removeChild(_projectButtons[i]);
          _projectButtons[i] = undefined;
        }
      } else if (!_projectButtons[i]) {
        createButton(i);
      }
    }

    if (updated) {
      syncEnabled();
      _visibilityUpdatedCallbacks.forEachCallback(true);
    }
  };

  var syncEnabled = function() {
    for (var i=0; i<ProjectList.length; i++) {
      if (!_projectButtons[i]) continue;

      var creat = ProjectList[i].cost.creativity;
      var yomi = ProjectList[i].cost.yomi;
      var ops = ProjectList[i].cost.operations;
      if (typeof(ops) === "function") ops = ops();
      // trust -- allow negative
      var dollars = ProjectList[i].cost.dollars;
      if (typeof(dollars) === "function") dollars = dollars();

      if ((creat && !creativityStorage.canConsume(creat)) || (yomi) || (ops && !operationsStorage.canConsume(ops)) ||
          (dollars && !accountant.canDebitDollars(dollars))) {
        _projectButtons[i].classList.add("disabled");
      } else {
        _projectButtons[i].classList.remove("disabled");
      }
    }
  };

  accountant.addCentsUpdatedCallback(syncVisibility);
  autoclipperFactory.addClippersUpdatedCallback(syncVisibility);
  autoclipperFactory.addEfficiencyUpdatedCallback(syncVisibility);
  clipFactory.addClipsUpdatedCallback(syncVisibility);
  clipWarehouse.addUnshippedUpdatedCallback(syncVisibility);
  creativityStorage.addEnabledUpdatedCallback(syncVisibility);
  creativityStorage.addCreativityUpdatedCallback(syncVisibility);
  operationsStorage.addOperationsUpdatedCallback(syncVisibility);
  quantumComputer.addEnabledUpdatedCallback(syncVisibility);
  trustWarehouse.addBribesUpdatedCallback(syncVisibility);
  trustWarehouse.addTrustUpdatedCallback(syncVisibility);
  wireMarket.addPurchasesUpdatedCallback(syncVisibility);
  wireMarket.addDollarsUpdatedCallback(syncVisibility);
  wireSupplier.addLengthUpdatedCallback(syncVisibility);

  accountant.addCentsUpdatedCallback(syncEnabled);
  creativityStorage.addCreativityUpdatedCallback(syncEnabled);
  operationsStorage.addOperationsUpdatedCallback(syncEnabled);

  _projectAppliedUpdatedCallbacks.push(syncVisibility);

  return {
    addProjectVisibilityUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _visibilityUpdatedCallbacks.push(callback);
    },
    bind: function(columnElement) {
      if (!columnElement) return;

      _groupDiv = columnElement.appendElement("div", undefined, {className: "group"});
      _groupDiv.appendElement("h2", undefined, {innerText: "Projects"});

      syncVisibility();
    },
    serialize: function() {
      return {
        applied: _projectApplied,
        specialProjectsApplied: _specialProjectsApplied,
        visible: _projectVisible
      };
    }
  };
};
