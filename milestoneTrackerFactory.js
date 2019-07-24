var milestoneTrackerFactory = function(clipFactory, consoleAppender) {
  if (!clipFactory || !clipFactory.addClipsUpdatedCallback) {
      console.assert(false, "No clip factory connected to the milestone tracker.");
      return;
  }

  if (!consoleAppender || !consoleAppender.append) {
      console.assert(false, "No console appender connected to the milestone tracker.")
      return;
  }

  const InitialLevel = 0;
  const Milestones = [
    5e2, // 500
    1e3, // 1,000
    1e4, // 10,000
    1e5, // 100,000
    1e6 // 1 Million
  ];

  var _level = InitialLevel;
  var _startTime = new Date();

  var durationToLocaleString = function() {
    var ticks = new Date() - _startTime;

    const HoursPerDay = 24;
    const MinutesPerHour = 60;
    const SecondsPerMinute = 60;
    const TicksPerSecond = 1000;
    const TicksPerMinute = TicksPerSecond * SecondsPerMinute;
    const TicksPerHour = TicksPerMinute * MinutesPerHour;
    const TicksPerDay = TicksPerHour * HoursPerDay;

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
  }

  clipFactory.addClipsUpdatedCallback(function(clips) {
    if (clips >= Milestones[_level]) {
        consoleAppender.append(Milestones[_level].toLocaleString() + " clips created in " + durationToLocaleString());

        _level++;
    }
  });
}
