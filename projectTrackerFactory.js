var projectTrackerFactory = function(accountant, autoclipperFactory, clipMarketing, clipSeller, clipWarehouse, consoleAppender, cpu,
    creativityStorage, megaclipperFactory, operationsStorage, trustWarehouse, wireMarket, wireSupplier, initial) {
  if (!accountant || !accountant.getCents || !accountant.addCentsUpdatedCallback) {
    console.assert(false, "No accountant connected to the project tracker.");
    return;
  }

  if (!autoclipperFactory || !autoclipperFactory.enhance || !autoclipperFactory.getClippers ||
      !autoclipperFactory.addClippersUpdatedCallback || !autoclipperFactory.addEfficiencyUpdatedCallback) {
    console.assert(false, "No autoclipper factory connected to the project tracker.");
    return;
  }

  if (!clipMarketing || !clipMarketing.enhance) {
    console.assert(false, "No clip marketing connected to the project tracker.");
    return;
  }

  if (!clipSeller || !clipSeller.enableRevTracker) {
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

  if (!trustWarehouse || !trustWarehouse.useTrust) {
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

  var incrementTrustFactory = function(value) {
    return function() { return trustWarehouse.increaseTrust(value); };
  };

  var enhanceAutoclipperFactory = function(value) {
    return function() { return autoclipperFactory.enhance(value); };
  };

  var enhanceMegaclipperFactory = function(value) {
    return function() { return megaclipperFactory.enhance(value); };
  };

  var increaseWireSpoolLengthFactory = function(value) {
    return function() { return wireSupplier.increaseSpoolLength(value)};
  }

  const SpecialProjectTitles = {
    LexicalProcessing: "Lexical Processing",
    CombinatoryHarmonics: "Combinatory Harmonics",
    HadwigerProblem: "The Hadwiger Problem",
    CatchyJingle: "Catchy Jingle",
    HypnoHarmonics: "Hypno Harmonics"
  };

  const ProjectList = [{
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
  }, {
    title: "Creativity",
    description: "Use idle operations to generate new problems and new solutions",
    cost: { operations: 1e3 },
    isVisible: function() {
      return cpu.isEnabled() && operationsStorage.isAtMax();
    },
    trigger: creativityStorage.enable,
    postTriggerMessages: ["Creativity unlocked (creativity increases while operations are at max)"]
  }, {
    title: "Xavier Re-initialization",
    description: "Re-allocate accumulated trust",
    cost: { creativity: 1e5 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: cpu.clear,
    postTriggerMessages: ["Trust now available for re-allocation"],
    disableAppliedTracking: true
  }, {
    title: "Limerick",
    description: "Algorithmically-generated poem (+1 Trust)",
    cost: { creativity: 10 },
    isVisible: function() {
      return creativityStorage.isEnabled();
    },
    trigger: incrementTrustFactory(1),
    postTriggerMessages: ["There was an AI made of dust, whose poetry gained it man's trust..."]
  }, {
    title: "Limerick (cont.)",
    description: "If is follows ought, it'll do what they thought",
    cost: { creativity: 1e6 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: function() { return true; },
    postTriggerMessages: ["In the end we all do what we must"]
  }, {
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
  }, {
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
  }, {
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
  }, {
    title: "The Tóth Sausage Conjecture",
    description: "Tubes within tubes within tubes... (+1 Trust)",
    cost: { creativity: 200 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: incrementTrustFactory(1),
    postTriggerMessages: [
      "The Tóth Sausage Conjecture: proven, TRUST INCREASED",
      "You can't invent a design. You recognize it, in the fourth dimension. -D.H. Lawrence"
    ]
  }, {
    title: "Donkey Space",
    description: "I think you think I think you think I think you think I think... (+1 Trust)",
    cost: { creativity: 250 },
    isVisible: function() {
      return creativityStorage.canConsume(this.cost.creativity);
    },
    trigger: incrementTrustFactory(1),
    postTriggerMessages: [
      "Donkey Space: mapped, TRUST INCREASED",
      "Every commercial transaction has within itself an element of trust. - Kenneth Arrow"
    ]
  }, {
    title: "Cure for Cancer",
    description: "The trick is tricking cancer into curing itself. (+10 Trust)",
    cost: { operations: 2500 },
    isVisible: function() {
      // Requires Coherent Extrapolated Volition
      return false;
    },
    trigger: function() {
      /*
       * TODO: stockGainThreshold = stockGainThreshold + .01;
       * Stocks are 51% positive rather than 50% positive - This is the same as an investment engine upgrade
       */
      return trustWarehouse.increaseTrust(10);
    },
    postTriggerMessages: ["Cancer is cured, +10 TRUST, global stock prices trending upward"]
  }, {
    title: "Male Pattern Baldness",
    description: "A cure for androgenetic alopecia. (+20 Trust)",
    cost: { operations: 20e3 },
    isVisible: function() {
      // Requires Coherent Extrapolated Volition
      return false;
    },
    trigger: function() {
      /*
       * TODO: stockGainThreshold = stockGainThreshold + .01;
       * Stocks are 51% positive rather than 50% positive - This is the same as an investment engine upgrade
       */
      return trustWarehouse.increaseTrust(10);
    },
    postTriggerMessages: [
      "Male pattern baldness cured, +20 TRUST, Global stock prices trending upward",
      "They are still monkeys"
    ]
  }, {
    title: "Improved AutoClippers",
    description: "Increases AutoClipper performance 25%",
    cost: { operations: 750 },
    isVisible: function() {
      return cpu.isEnabled() && autoclipperFactory.getClippers() > 0;
    },
    trigger: enhanceAutoclipperFactory(25),
    postTriggerMessages: ["AutoClippper performance boosted by 25%"]
  }, {
    title: "Even Better AutoClippers",
    description: "Increases AutoClipper performance by an additional 50%",
    cost: { operations: 2500 },
    isVisible: function() {
      return autoclipperFactory.getEfficiency() >= 1.25;
    },
    trigger: enhanceAutoclipperFactory(50),
    postTriggerMessages: ["AutoClippper performance boosted by another 50%"]
  }, {
    title: "Optimized AutoClippers",
    description: "Increases AutoClipper performance by an additional 75%",
    cost: { operations: 5e3 },
    isVisible: function() {
      return autoclipperFactory.getEfficiency() >= 1.75;
    },
    trigger: enhanceAutoclipperFactory(75),
    postTriggerMessages: ["AutoClippper performance boosted by another 75%"]
  }, {
    title: "Hadwiger Clip Diagrams",
    description: "Increases AutoClipper performance by an additional 500%",
    cost: { operations: 6e3 },
    isVisible: function() {
      return _specialProjectsApplied.includes(SpecialProjectTitles.HadwigerProblem);
    },
    trigger: enhanceAutoclipperFactory(500),
    postTriggerMessages: ["AutoClippper performance improved by 500%"]
  }, {
    title: "Improved Wire Extrusion",
    description: "50% more wire supply from every spool",
    cost: { operations: 1750 },
    isVisible: function() {
      return cpu.isEnabled() && wireMarket.getPurchases() > 0;
    },
    trigger: increaseWireSpoolLengthFactory(50),
    postTriggerMessages: ["Wire extrusion technique improved, 1,500 supply from every spool"]
  }, {
    title: "Optimized Wire Extrusion",
    description: "75% more wire supply from every spool",
    cost: { operations: 3500 },
    isVisible: function() {
      return wireSupplier.getSpoolLength() >= 1500;
    },
    trigger: increaseWireSpoolLengthFactory(75),
    postTriggerMessages: ["Wire extrusion technique improved, 2,625 supply from every spool"]
  }, {
    title: "Microlattice Shapecasting",
    description: "100% more wire supply from every spool",
    cost: { operations: 7500 },
    isVisible: function() {
      return wireSupplier.getSpoolLength() >= 2625;
    },
    trigger: increaseWireSpoolLengthFactory(100),
    postTriggerMessages: ["Using microlattice shapecasting techniques we now get 5,250 supply from every spool"]
  }, {
    title: "Spectral Froth Annealment",
    description: "200% more wire supply from every spool",
    cost: { operations: 12e3 },
    isVisible: function() {
      return wireSupplier.getSpoolLength() >= 5250;
    },
    trigger: increaseWireSpoolLengthFactory(200),
    postTriggerMessages: ["Using spectral froth annealment we now get 15,750 supply from every spool"]
  }, {
    title: "Quantum Foam Annealment",
    description: "1,000% more wire supply from every spool",
    cost: { operations: 15e3 },
    isVisible: function() {
      return wireMarket.getDollars() >= 125;
    },
    trigger: increaseWireSpoolLengthFactory(1e3),
    postTriggerMessages: ["Using quantum foam annealment we now get 173,250 supply from every spool"]
  }, {
    title: "RevTracker",
    description: "Automatically calculates average revenue per second",
    cost: { operations: 500 },
    isVisible: function() {
      return cpu.isEnabled();
    },
    trigger: clipSeller.enableRevTracker,
    postTriggerMessages: ["RevTracker online"]
  }, {
    title: "WireBuyer",
    description: "Automatically purchases wire when you run out",
    cost: { operations: 7e3 },
    isVisible: function() {
      return wireMarket.getPurchases() >= 15;
    },
    trigger: wireMarket.enableWireBuyer,
    postTriggerMessages: ["WireBuyer online"]
  }, {
    title: "MegaClippers",
    description: "500x more powerful than a standard AutoClipper",
    cost: { operations: 12e3 },
    isVisible: function() {
      return autoclipperFactory.getClippers() >= 75;
    },
    trigger: megaclipperFactory.enable,
    postTriggerMessages: ["MegaClipper technology online"]
  }, {
    title: "Improved MegaClippers",
    description: "Increases MegaClipper performance 25%",
    cost: { operations: 14e3 },
    isVisible: megaclipperFactory.isEnabled,
    trigger: enhanceMegaclipperFactory(25),
    postTriggerMessages: ["MegaClippper performance increased by 25%"]
  }, {
    title: "Even Better MegaClippers",
    description: "Increases MegaClipper performance by an additional 50%",
    cost: { operations: 17e3 },
    isVisible: function() {
      return megaclipperFactory.getEfficiency() >= 1.25
    },
    trigger: enhanceMegaclipperFactory(50),
    postTriggerMessages: ["MegaClippper performance increased by 50%"]
  }, {
    title: "Optimized MegaClippers",
    description: "Increases MegaClipper performance by an additional 100%",
    cost: { operations: 19500 },
    isVisible: function() {
      return megaclipperFactory.getEfficiency() >= 1.75
    },
    trigger: enhanceMegaclipperFactory(100),
    postTriggerMessages: ["MegaClippper performance increased by 100%"]
  }, {
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
  }, {
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
  }, {
    title: SpecialProjectTitles.HypnoHarmonics,
    description: "Use neuro-resonant frequencies to influence consumer behavior",
    cost: {
      operations: 7500,
      trust: 1
    },
    isVisible: function() {
      return _projectVisible.includes(SpecialProjectTitles.CombinatoryHarmonics);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
      return clipMarketing.enhance(400);
    },
    postTriggerMessages: ["Marketing is now 5 times more effective"]
  }, {
    title: "HypnoDrones",
    description: "Autonomous aerial brand ambassadors",
    cost: { operations: 70e3 },
    isVisible: function() {
      return _projectVisible.includes(SpecialProjectTitles.HypnoHarmonics);
    },
    trigger: function() {
      _specialProjectsApplied.push(this.title);
    },
    postTriggerMessages: ["HypnoDrone tech now available..."]
  }
  // Quantum Computing
  // Photonic Chip
  // Algorithmic Trading
  // Hostile Takeover
  // Full Monopoly
  // A Token of Goodwill...
  // Another Token of Goodwill...
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
  var _specialProjectsApplied = (initial && initial.specialProjectsApplied) || InitialSpecialProjectsApplied;
  var _projectVisible = (initial && initial.visible) || InitialVisible;
  var _projectAppliedUpdatedCallbacks = new Array();
  var _visibilityUpdatedCallbacks = new Array();
  var _projectButtons = new Array();
  var _groupDiv;

  var createButton = function(index) {
    if (!_groupDiv) return;

    var onclickFactory = function(index) {
      return function() {
        if (!_projectButtons[index] || _projectButtons[index].classList.contains("disabled")) return;

        var project = ProjectList[index];
        var ops = project.cost.operations;
        var creativity = project.cost.creativity;
        var trust = project.cost.trust;
        if (ops) {
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
        if (creativity) {
          if (!creativityStorage.consume(creativity)) {
            console.warn("Insufficient creativity to trigger the " + project.title + " project.");
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
    var ops = ProjectList[index].cost.operations;
    var trust = ProjectList[index].cost.trust;
    var buttonDiv = _projectButtons[index] = document.createElement("div");
    buttonDiv.className = "project-button";
    if (ops && !operationsStorage.canConsume(ops)) buttonDiv.classList.add("disabled");
    _groupDiv.appendChild(buttonDiv);

    var titleDiv = document.createElement("div");
    buttonDiv.appendChild(titleDiv);

    var titleSpan = document.createElement("span");
    titleSpan.className = "title";
    titleSpan.innerText = ProjectList[index].title;
    titleDiv.appendChild(titleSpan);
    if (creat || ops || trust) {
      titleDiv.appendChild(document.createTextNode(" ("));
      if (creat) titleDiv.appendChild(document.createTextNode(creat.toLocaleString() + " creat"));
      if (creat && ops) titleDiv.appendChild(document.createTextNode(", "));
      if (ops) titleDiv.appendChild(document.createTextNode(ops.toLocaleString() + " ops"));
      if ((creat || ops) && trust) titleDiv.appendChild(document.createTextNode(", "));
      if (trust) titleDiv.appendChild(document.createTextNode( + trust.toLocaleString() + " Trust"));
      titleDiv.appendChild(document.createTextNode(")"));
    }

    var descriptionDiv = document.createElement("div");
    descriptionDiv.innerText = ProjectList[index].description;
    buttonDiv.appendChild(descriptionDiv);

    buttonDiv.onclick = onclickFactory(index);
  };

  var syncVisibility = function() {
    var updated = false;
    for (var i=0; i<ProjectList.length; i++) {
      var previous = _projectVisible[i] || false;
      _projectVisible[i] = !_projectApplied[i] && (previous || ProjectList[i].isVisible());
      updated = updated || (previous != _projectVisible[i]);

      if (!_projectVisible[i]) {
        if (_projectButtons[i]) {
          if (_groupDiv) _groupDiv.removeChild(_projectButtons[index]);
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
      var ops = ProjectList[i].cost.operations;
      var creativity = ProjectList[i].cost.creativity;
      if ((!ops || operationsStorage.canConsume(ops)) && (!creativity || creativityStorage.canConsume(creativity))) {
        _projectButtons[i].classList.remove("disabled");
      } else {
        _projectButtons[i].classList.add("disabled");
      }
    }
  };

  accountant.addCentsUpdatedCallback(syncVisibility);
  autoclipperFactory.addClippersUpdatedCallback(syncVisibility);
  autoclipperFactory.addEfficiencyUpdatedCallback(syncVisibility);
  clipWarehouse.addUnshippedUpdatedCallback(syncVisibility);
  creativityStorage.addEnabledUpdatedCallback(syncVisibility);
  creativityStorage.addCreativityUpdatedCallback(syncVisibility);
  operationsStorage.addOperationsUpdatedCallback(syncVisibility);
  wireMarket.addPurchasesUpdatedCallback(syncVisibility);
  wireMarket.addDollarsUpdatedCallback(syncVisibility);
  wireSupplier.addLengthUpdatedCallback(syncVisibility);

  creativityStorage.addCreativityUpdatedCallback(syncEnabled);
  operationsStorage.addOperationsUpdatedCallback(syncEnabled);
  trustWarehouse.addTrustUpdatedCallback(syncEnabled);

  _projectAppliedUpdatedCallbacks.push(syncEnabled);

  return {
    bind: function(columnElement) {
      if (!columnElement) return;

      _groupDiv = document.createElement("div");
      _groupDiv.className = "group";
      columnElement.appendChild(_groupDiv);

      var heading = document.createElement("h2");
      heading.innerText = "Projects";
      _groupDiv.appendChild(heading);

      syncVisibility();
    },
    serialize: function() {
      return {
        applied: _projectApplied,
        specialProjectsApplied: _specialProjectsApplied,
        visible: _projectVisible
      };
    },
    addProjectVisibilityUpdatedCallback: function(callback) {
      if (callback) _visibilityUpdatedCallbacks.push(callback);
    }
  };
};
