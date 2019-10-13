function Store(initialState) {
  this.state = initialState
}

Store.prototype.getState = function() {
  return this.state
}

Store.prototype.updateState = function(update) {
  this.state = {
    ...this.state,
    ...update
  }
}

const store = new Store({
  ctx: document.getElementById('canvas').getContext('2d'),
  isGameStarted: false,
  previousSongID: 0,
  note: null,
  noteName: null,
  chord: null,
  interval: null,
  songID: 0,
  scene: 0,
  previousScene: 0,
  isFirstFrame: false,
  playerHP: 100,
  songFinished: false,
  shouldEnd: true,
  volume: 0.79
})

module.exports = store