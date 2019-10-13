const GameObject = require('../shared/GameObject')
const store = require('../store')

function Win() {
  // Static objects
  this.thanksForPlayingText = new GameObject(0, 0, ['/resources/backgrounds/thanksForPlaying2.png']);
}

Win.prototype.doFrame = function() {
  const { isFirstFrame, note } = store.getState()

  if (isFirstFrame) {
    store.updateState({ songID: 5 })
  }

  // Draw
  this.thanksForPlayingText.draw()
}

Win.prototype.loadResources = function() {
  promises.push(this.thanksForPlayingText.load())
  return Promise.all(promises)
}

module.exports = Win