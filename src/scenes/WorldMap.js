function Scene() {
  // Static objects
  this.background = new GameObject(0, 0, '/resources/backgrounds/battle.png')
}

Scene.prototype.doFrame = function() {
  // Update
  
  // Draw
  this.background.draw()
}

Scene.prototype.loadResources = function() {
  let promises = []
  promises.push(this.background.load())

  return Promise.all(promises)
}