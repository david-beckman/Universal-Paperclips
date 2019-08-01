var milestoneTrackerFactory = function(clipFactory, consoleAppender, initial) {
  if (!clipFactory || !clipFactory.addClipsUpdatedCallback) {
    console.assert(false, "No clip factory connected to the milestone tracker.");
    return;
  }

  if (!consoleAppender || !consoleAppender.append) {
    console.assert(false, "No console appender connected to the milestone tracker.");
    return;
  }

  const InitialLevel = 0;
  const InitialTicks = 0;
  const Milestones = [
    { value: 5e2 }, // 500
    { value: 1e3 }, // 1,000
    { value: 1e4 }, // 10,000
    { value: 1e5 }, // 100,000
    { value: 1e6 }, // 1,000,000 - One Million
    { value: 1e12, display: "One Trillion"},
    { value: 1e15, display: "One Quadrillion"},
    { value: 1e18, display: "One Quintillion"},
    { value: 1e21, display: "One Sextillion"},
    { value: 1e24, display: "One Septillion"},
    { value: 1e27, display: "One Octillion"}
  ];

  var _level = (initial && initial.level) || InitialLevel;
  var _levelUpdatedCallbacks = new Array();
  var _startTime = new Date();
  var _ticks = (initial && initial.ticks) || InitialTicks;

  var getTicks = function() {
    return new Date() - _startTime + _ticks;
  };

  var durationToLocaleString = function() {
    const HoursPerDay = 24;
    const MinutesPerHour = 60;
    const SecondsPerMinute = 60;
    const TicksPerSecond = 1000;
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

  clipFactory.addClipsUpdatedCallback(function(clips) {
    var level = Milestones[_level];
    if (clips < level.value) return;

    consoleAppender.append((level.display || level.value.toLocaleString()) + " clips created in " + durationToLocaleString());

    _level++;
    _levelUpdatedCallbacks.forEach(function(callback) {
      setTimeout(function() { callback(_level); }, 0);
    });
  });

  return {
    bind: function(save) {
      if (save) _levelUpdatedCallbacks.push(save);
    },
    serialize: function() {
      return {
        level: _level,
        ticks: getTicks()
      };
    }
  };
};
