const GameObject = require('../shared/GameObject')
const store = require('../store')

function WorldMapTwo() {
  // Static objects
  this.background = new GameObject(0, 0, ['/resources/backgrounds/path.png'])

  this.player = new GameObject(116, 85, ['/resources/characters/player.png'])
  this.tree = new GameObject(0, 0, ['/resources/backgrounds/tree.png'])
  this.frames = 0
}

WorldMapTwo.prototype.doFrame = function() {
  const { isFirstFrame, note } = store.getState()

  // Update
  if (isFirstFrame) {
    store.updateState({ songID: 5 })
  }

  if (this.player.y > 35) {
    this.player.y -= 1
  }

  this.frames++

  if (this.frames > 100) {
    store.updateState({ scene: 2 })
  }
  
  // Draw
  this.background.draw()
  this.player.draw()
}

WorldMapTwo.prototype.loadResources = function() {
  let promises = []
  promises.push(this.background.load())
  promises.push(this.player.load())
  promises.push(this.tree.load())

  return Promise.all(promises)
}

module.exports = WorldMapTwo