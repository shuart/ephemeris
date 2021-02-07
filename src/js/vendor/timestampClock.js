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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  var nanoid=(t=21)=>{let e="",r=crypto.getRandomValues(new Uint8Array(t));for(;t--;){let n=63&r[t];e+=n<36?n.toString(36):n<62?(n-26).toString(36).toUpperCase():n<63?"_":"-"}return e};
  // let uuid = genClockuuid()
  let uuid = nanoid()
  return uuid
    .replace(/-/g, '')
    .replace(/_/g, '')
    .slice(-16);
}
