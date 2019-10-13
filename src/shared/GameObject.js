const store = require('../store')

function GameObject(x, y, textureUrls) {
  this.isVisible = true;
  this.currentTexture = 0;
  this.x = x;
  this.y = y;
  this.textureUrls = textureUrls;
  this.textures = [];

  for (let i = 0; i < this.textureUrls.length; i++) {
    this.textures.push(new Image())
  }
}

GameObject.prototype.load = function() {
  promises = []

  for (let i = 0; i < this.textureUrls.length; i++) {
    promises.push(new Promise((resolve, reject) => {
      this.textures[i].addEventListener('load', e => { resolve(); console.log('loaded') })
      this.textures[i].src = this.textureUrls[i]
    }))
  }
  
  return Promise.all(promises)
}

GameObject.prototype.draw = function(width, height) {
  const { ctx } = store.getState()

  if (this.isVisible) {
    if (width) {
      ctx.drawImage(this.textures[this.currentTexture], this.x, this.y, width, height)
      return
    }

    ctx.drawImage(this.textures[this.currentTexture], this.x, this.y)
  }
}

module.exports = GameObject