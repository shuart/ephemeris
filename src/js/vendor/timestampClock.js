let _clock = null;

function setClock(clock) {
  _clock = clock;
}

function getClock() {
  return _clock;
}

function makeClock(timestamp, merkle = {}) {
  return { timestamp: MutableTimestamp.from(timestamp), merkle };
}

function serializeClock(clock) {
  return JSON.stringify({
    timestamp: clock.timestamp.toString(),
    merkle: clock.merkle
  });
}

function deserializeClock(clock) {
  const data = JSON.parse(clock);
  return {
    timestamp: Timestamp.from(Timestamp.parse(data.timestamp)),
    merkle: data.merkle
  };
}

function makeClientId() {
  function genClockuuid() {
    return 'itxxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  let uuid =genClockuuid()
  return uuid
    .replace(/-/g, '')
    .slice(-16);
}
