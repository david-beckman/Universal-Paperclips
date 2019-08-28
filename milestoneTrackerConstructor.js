var milestoneTrackerConstructor = function(clipFactory, consoleAppender, initial) {
  if (!clipFactory || !clipFactory.addClipsUpdatedCallback) {
    console.assert(false, "No clip factory connected to the milestone tracker.");
    return;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the milestone tracker.");
    return;
  }

  const InitialLogLevel = 0;
  const InitialFibonacciLevel = 2;
  const InitialTicks = 0;

  const FibonacciFactor = 1e3;
  const LogMilestones = [
    { value: 500 },
    { value: 1e3 }, // 1,000
    { value: 10e3 }, // 10,000
    { value: 100e3 }, // 100,000
    { value: 1e6 }, // 1,000,000 - One Million
    // {value: 1e9, display: "One Billion"},
    { value: 1e12, display: "One Trillion"},
    { value: 1e15, display: "One Quadrillion"},
    { value: 1e18, display: "One Quintillion"},
    { value: 1e21, display: "One Sextillion"},
    { value: 1e24, display: "One Septillion"},
    { value: 1e27, display: "One Octillion"}
  ];

  var _logLevel = (initial && initial.logLevel) || InitialLogLevel;
  var _fibonacciLevel = (initial && initial.fibonacciLevel) || InitialFibonacciLevel;
  var _fibonacciLevelUpdatedCallbacks = [];
  var _startTime = new Date();
  var _ticks = (initial && initial.ticks) || InitialTicks;

  var _fibonacci = [1, 1, 2, 3];

  var getTicks = function() {
    return new Date() - _startTime + _ticks;
  };

  var durationToLocaleString = function() {
    const HoursPerDay = 24;
    const MinutesPerHour = 60;
    const SecondsPerMinute = 60;
    const TicksPerMinute = TicksPerSecond * SecondsPerMinute;
    const TicksPerHour = TicksPerMinute * MinutesPerHour;
    const TicksPerDay = TicksPerHour * HoursPerDay;

    var ticks = getTicks();
    var days = Math.floor(ticks / TicksPerDay);
    var hours = Math.floor(ticks % TicksPerDay / TicksPerHour);
    var minutes = Math.floor(ticks % TicksPerDay % TicksPerHour / TicksPerMinute);
    var seconds = Math.floor(ticks % TicksPerDay % TicksPerHour % TicksPerMinute / TicksPerSecond);

    var message = "";
    if (days > 0) message += days + " day" + (days > 1 ? "s" : "") + ", ";
    if (hours > 0) message += hours + " hour" + (hours > 1 ? "s" : "") + ", ";
    if (minutes > 0) message += minutes + " minute" + (minutes > 1 ? "s" : "") + ", ";
    if (seconds > 0 || message === "") message += seconds + " second" + (seconds > 1 ? "s" : "") + "..";

    return message.substring(0, message.length - 2);
  };

  var checkLogLevel = function(clips) {
    var level = LogMilestones[_logLevel];
    if (clips < level.value) return;

    consoleAppender.append((level.display || level.value.toLocaleString()) + " clips created in " + durationToLocaleString());

    _logLevel++;
  };

  var getFibonacciClipTarget = function() {
    while (_fibonacci.length <= (_fibonacciLevel)) {
      _fibonacci[_fibonacci.length] = _fibonacci[_fibonacci.length - 1] + _fibonacci[_fibonacci.length - 2];
    }

    return _fibonacci[_fibonacciLevel] * FibonacciFactor;
  };

  var incrementFibonacciLevel = function() {
    _fibonacciLevel++;
    _fibonacciLevelUpdatedCallbacks.forEachCallback(_fibonacciLevel);
  };

  var checkFibonacciLevel = function(clips) {
    if (clips < getFibonacciClipTarget()) return;
    incrementFibonacciLevel();
  };

  clipFactory.addClipsUpdatedCallback(function(clips) {
    checkLogLevel(clips);
    checkFibonacciLevel(clips);
  });

  return {
    bind: function() { },
    incrementFibonacciLevel: incrementFibonacciLevel,
    addFibonacciLevelUpdatedCallback: function(callback) {
      if (typeof(callback) === "function") _fibonacciLevelUpdatedCallbacks.push(callback);
    },
    getFibonacciClipTarget: getFibonacciClipTarget,
    serialize: function() {
      return {
        logLevel: _logLevel,
        fibonacciLevel: _fibonacciLevel,
        ticks: getTicks()
      };
    }
  };
};
