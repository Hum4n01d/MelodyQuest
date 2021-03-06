const GameObject = require('../shared/GameObject')
const store = require('../store')

function WorldMap() {
  // Static objects
  this.background = new GameObject(0, 0, ['/resources/backgrounds/path.png'])

  this.player = new GameObject(116, 175, ['/resources/characters/player.png'])
  this.tree = new GameObject(0, 0, ['/resources/backgrounds/tree.png'])
  this.frames = 0
}

WorldMap.prototype.doFrame = function() {
  const { isFirstFrame, note } = store.getState()

  // Update
  if (isFirstFrame) {
    store.updateState({ songID: 5 })
  }

  if (this.player.y > 95) {
    this.player.y -= 1
  }

  this.frames++

  if (this.frames > 100) {
    store.updateState({ scene: 1 })
  }
  
  // Draw
  this.background.draw()
  this.tree.draw()
  this.player.draw()
}

WorldMap.prototype.loadResources = function() {
  let promises = []
  promises.push(this.background.load())
  promises.push(this.player.load())
  promises.push(this.tree.load())

  return Promise.all(promises)
}

module.exports = WorldMap