const Pizzicato = require('pizzicato')

const GameObject = require('../shared/GameObject')
const store = require('../store')

function TitleScreen() {
  // Static objects
  this.background = new GameObject(0, 0, ['/resources/backgrounds/titleScreen.png']);
  this.keyPrompt = new GameObject(63, 155, ['/resources/text/titleScreenKeyPrompt.png']);
  this.hyphenhacksText = new GameObject(65, 209, ['/resources/text/hyphenhacks.png']);

  // Logo objects
  this.trebleClef = new GameObject(0, 0, ['/resources/logo/trebleClef.png']);
  this.melodyText = new GameObject(0, 0, ['/resources/logo/melody.png']);
  this.questText = new GameObject(0, 0, ['/resources/logo/quest.png']);

  this.swordHead = new GameObject(133, 42, ['/resources/logo/swordHead.png']);
  this.swordMiddle = new GameObject(133, 71, ['/resources/logo/swordMiddle.png']);
  this.swordBottom = new GameObject(127, 101, ['/resources/logo/swordBottom.png']);

  // Local variables
  this.flashFrameCount = 0;
  this.swordOffset = 198;
  this.textOffset = 124;
}

TitleScreen.prototype.doFrame = function() {
  const { isFirstFrame, note } = store.getState()

  if (isFirstFrame) {
    this.flashFrameCount = 0;
    this.swordOffset = 198;
    this.textOffset = 124;
  }

  if (note) {
    store.updateState({ scene: 3 })

    return
  }

  // Update
  this.swordHead.y = 42 + this.swordOffset
  this.swordMiddle.y = 71 + this.swordOffset
  this.swordBottom.y = 101 + this.swordOffset
  this.keyPrompt.isVisible = this.flashFrameCount < 12
  this.melodyText.x = this.textOffset * -1
  this.questText.x = this.textOffset

  // Advance frame
  if (this.swordOffset > 0) {
    this.swordOffset -= 8

    if (this.swordOffset === 190) {
      this.swordSfx.play()
    }

    if (this.swordOffset < 0) {
      this.swordOffset = 0
      this.crashSfx.play()
    }
  } else {
    this.textOffset -= 20

    if (this.textOffset < 0) {
      this.textOffset = 0
    }
  }

  this.trebleClef.isVisible = this.swordOffset === 0
  this.flashFrameCount = (this.flashFrameCount + 1) % 24;

  // Draw
  this.background.draw()
  this.keyPrompt.draw()
  this.hyphenhacksText.draw()

  this.swordHead.draw()

  this.trebleClef.draw()
  this.melodyText.draw()
  this.questText.draw()

  this.swordMiddle.draw()
  this.swordBottom.draw()
}

TitleScreen.prototype.loadResources = function() {
  let promises = []
  promises.push(new Promise((resolve, reject) => {
    this.swordSfx = new Pizzicato.Sound('/resources/soundEffects/sword.wav', resolve)
  }))
  promises.push(new Promise((resolve, reject) => {
    this.crashSfx = new Pizzicato.Sound('/resources/soundEffects/crash.wav', resolve)
  }))
  promises.push(this.background.load())
  promises.push(this.keyPrompt.load())
  promises.push(this.hyphenhacksText.load())
  promises.push(this.trebleClef.load())
  promises.push(this.melodyText.load())
  promises.push(this.questText.load())
  promises.push(this.swordHead.load())
  promises.push(this.swordMiddle.load())
  promises.push(this.swordBottom.load())
  return Promise.all(promises)
}

module.exports = TitleScreen