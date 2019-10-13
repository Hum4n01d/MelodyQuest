const Pizzicato = require('pizzicato')

const GameObject = require('../shared/GameObject')
const store = require('../store')

function Battle() {
  // Static objects
  this.background = new GameObject(0, 0, ['/resources/backgrounds/battle.png'])

  // UI
  this.frame = new GameObject(0, 169, ['/resources/backgrounds/frame.png'])
  this.message = new GameObject(0, 169, ['/resources/text/enemyAppeared.png', '/resources/text/moves.png', '/resources/text/attackMissed.png', '/resources/text/defend.png', '/resources/text/attackDodged.png', '/resources/text/defeated.png'])
  this.playerHud = new GameObject(0, 0, ['/resources/backgrounds/playerHud.png'])
  this.enemyHud = new GameObject(0, 0, ['/resources/backgrounds/enemyHud.png'])
  this.playerHealth = new GameObject(105, 159, ['/resources/backgrounds/health.png'])
  this.enemyHealth = new GameObject(56, 7, ['/resources/backgrounds/health.png'])
  this.powerHud = new GameObject(0, 0, ['/resources/backgrounds/powerHud.png'])
  this.powerHud.isVisible = false
  this.power = new GameObject(66, 133, ['/resources/backgrounds/power.png'])
  this.noteReadingExercise = new GameObject(60, 8, ['/resources/exercises/a.png', '/resources/exercises/b.png', '/resources/exercises/c.png', '/resources/exercises/d.png', '/resources/exercises/e.png', '/resources/exercises/f.png', '/resources/exercises/f2.png', '/resources/exercises/g.png'])
  this.sightReadingExercise = new GameObject(10, 10, ['/resources/exercises/1.png', '/resources/exercises/2.png', '/resources/exercises/3.png', '/resources/exercises/4.png', '/resources/exercises/5.png'])
  this.timer = new GameObject(10, 98, ['/resources/backgrounds/power.png'])
  this.noteReadingExercise.isVisible = false
  this.sightReadingExercise.isVisible = false
  this.power.isVisible = false
  this.timer.isVisible = false

  // Characters
  this.enemy = new GameObject(102, 77, ['/resources/characters/demoEnemy.png'])
  this.player = new GameObject(120, 115, ['/resources/characters/player.png'])
}

Battle.prototype.doFrame = function() {
  const { isFirstFrame, chord, playerHP, ctx, noteName, songFinished, note, songID, shouldEnd, interval } = store.getState()

  if (isFirstFrame) {
    store.updateState({ songID: 1 })

    this.frameOffset = 71
    this.isFrameVisible = false
    this.stickMessage = false
    this.enemyOffset = 0
    this.enemyXOffset = 102
    this.enemyDirection = false
    this.playerOffset = 115
    this.enemyHP = 100
    this.powerPoints = 10
    this.powerDirection = false
    this.notesMap = ['a', 'b', 'c', 'd', 'e', 'f', 'f', 'g']
    this.melodyMap = [[57, 59, 60, 62, 59, 55, 57], [64, 62, 60, 57, 57, 64, 62, 62], [57, 64, 57, 63, 64, 63, 60], [57, 61, 64, 56, 57, 59, 57], [57, 60, 64, 60, 57, 64, 64, 64]]
    this.flickerFrame = 0
    this.currentMelody = 0
    this.isAttackAnimationPlaying = false
    this.isAttackedAnimationPlaying = false
    this.attackAnimationFrames = 0
    this.playedNotes = []
    this.timerFrames = 420
    this.isCheckingForInterval = false
    this.currentInterval = 0
    this.intervals = ['M2', 'm2', 'M3', 'm3', 'P4', 'P5', 'M6', 'P8']
    this.intervalsVerbose = ['major 2nd', 'minor 2nd', 'major 3rd', 'minor 3rd', 'perfect 4th', 'perfect 5th', 'major 6th', 'perfect 8th']

    store.updateState({ shouldEnd: true })

    this.pushMessage(0, false)
  }

  // Update
  this.frame.y = this.frameOffset + 169
  this.enemy.x = this.enemyXOffset
  this.enemy.y = this.enemyOffset + 67
  this.player.y = this.playerOffset + 115
  this.playerHud.y = this.frameOffset
  this.playerHealth.y = this.frameOffset + 159

  // Advance frame
  if (this.isFrameVisible) {
    if (this.frameOffset > 0) {
      this.frameOffset -= 10

      if (this.frameOffset < 0) {
        this.frameOffset = 0
      }
    }
  } else {
    if (this.frameOffset < 71) {
      this.frameOffset += 10

      if (this.frameOffset > 71) {
        this.frameOffset = 71

        // Push new message based on previous
        if (this.message.currentTexture === 0) {
          this.pushMessage(1, true)
        }

        if (this.message.currentTexture === 2) {
          this.startDefend()
        }

        if (this.message.currentTexture === 4) {
          this.playedNotes = []
          this.pushMessage(1, true)
        }

        if (this.message.currentTexture === 5) {
          store.updateState({ scene: 2 })
        }
      }
    }
  }

  if (this.playerOffset > 0) {
    this.playerOffset -= 15
  }

  if (this.playerOffset < 0) {
    this.playerOffset = 0
  }

  if (chord) {
    if (this.message.currentTexture === 1 && this.isFrameVisible) {
      this.isFrameVisible = false

      if (chord.endsWith('m')) {
        console.log('minor')
        this.isCheckingForInterval = true
        this.currentInterval = Math.round(Math.random() * (this.intervals.length - 1))
      } else {
        console.log('majro')
        this.noteReadingExercise.currentTexture = Math.round(Math.random() * 7)
        this.noteReadingExercise.isVisible = true
      }

      this.swordSfx.stop()
      this.swordSfx.play()
      this.powerPoints = 0
      this.powerDirection = false
      this.powerHud.isVisible = true
      this.power.isVisible = true
      
      store.updateState({ volume: 0.39 })
    }
  } else if (note && this.message.currentTexture === 3 && !this.isAttackedAnimationPlaying) {
    // Melody check
    const correctNote = this.melodyMap[this.sightReadingExercise.currentTexture][this.playedNotes.length]

    if (note == correctNote) {
      console.log('correct')
      this.playedNotes.push(note)
    } else {
      console.log('wrong')
      this.playedNotes = []
      this.attackAnimationFrames = 0
      this.sightReadingExercise.isVisible = false
      this.isAttackedAnimationPlaying = true
      this.sightReadingExercise.currentTexture = (this.sightReadingExercise.currentTexture + 1) % 5
      this.timer.isVisible = false
      store.updateState({ shouldEnd: false })
      store.updateState({ songID: 1 })
    }

    if (this.playedNotes.length === this.melodyMap[this.sightReadingExercise.currentTexture].length) {
      store.updateState({ shouldEnd: false })
      store.updateState({ songID: 1 })
      this.sightReadingExercise.isVisible = false
      this.timer.isVisible = false
      this.pushMessage(4, false)
      this.sightReadingExercise.currentTexture = (this.sightReadingExercise.currentTexture + 1) % 5
    }
  }

  if (playerHP <= 0) {
    store.updateState({ playerHP: 100, scene: 0 })
  }

  if (songFinished) {
    this.attackAnimationFrames = 0
    this.timer.isVisible = false
    this.sightReadingExercise.isVisible = false
    this.isAttackedAnimationPlaying = true
  }

  if (this.isAttackAnimationPlaying) {
    if (this.attackAnimationFrames === 0) {
      this.isFrameVisible = false
    }

    if (this.attackAnimationFrames < 3) {
      this.playerOffset -= 3
    } else if (this.attackAnimationFrames < 6) {
      this.playerOffset += 3
    } else if (this.attackAnimationFrames === 6) {
      this.crashSfx.stop()
      this.crashSfx.play()
    } else if (this.attackAnimationFrames === 90) {
      if (Math.round(this.enemyHP) <= 0) {
        this.pushMessage(5, true)
      } else {
        this.isAttackAnimationPlaying = false
        this.startDefend()
      }
    } else if (this.attackAnimationFrames >= 90 && this.enemyHP == 0) {
      this.enemyXOffset += 20

      if (this.attackAnimationFrames === 110) {
        store.updateState({ songID: 4 })
      }

      if (this.attackAnimationFrames === 290) {
        this.isFrameVisible = false
      }
    }

    this.attackAnimationFrames++
  }

  if (noteName && this.noteReadingExercise.isVisible && this.powerPoints > 20) {
    if (noteName.includes(this.notesMap[this.noteReadingExercise.currentTexture])) {
      console.log('t')

      this.runAttackAnimation()
    } else {
      console.log('f')
      this.pushMessage(2, false)
    }

    this.powerPoints = 0
    this.power.isVisible = false
    this.powerHud.isVisible = false
    this.noteReadingExercise.isVisible = false
    store.updateState({ volume: 0.75 })
  }

  if (interval && this.isCheckingForInterval && this.powerPoints > 20) {
    if (interval === this.intervals[this.currentInterval]) {
      this.runAttackAnimation()
    } else {
      this.pushMessage(2, false)
    }

    this.powerPoints = 0
    this.power.isVisible = false
    this.powerHud.isVisible = false
    this.isCheckingForInterval = false
    store.updateState({ volume: 0.75 })
  }

  if (this.timer.isVisible && this.timerFrames > 0) {
    this.timerFrames -= 1
  }

  if (this.isAttackedAnimationPlaying) {
    if (this.attackAnimationFrames === 0) {
      this.isFrameVisible = false
    }

    if (this.attackAnimationFrames < 3) {
      this.enemyOffset -= 3
    } else if (this.attackAnimationFrames < 6) {
      this.enemyOffset += 3
    } else if (this.attackAnimationFrames === 6) {
      this.crashSfx.stop()
      this.crashSfx.play()
      store.updateState({ playerHP: playerHP - 20})
    } else if (this.attackAnimationFrames === 50) {
      this.attackAnimationFrames = 0
      this.isAttackedAnimationPlaying = false
      this.pushMessage(1, true)
    }

    this.attackAnimationFrames++
  } else {
    if (this.enemyDirection) {
      this.enemyOffset += 0.3
      
      if (this.enemyOffset > 2.5) {
        this.enemyDirection = false
      }
    } else {
      this.enemyOffset -= 0.3
      
      if (this.enemyOffset < -2.5) {
        this.enemyDirection = true
      }   
    }
  }

  if (this.power.isVisible) {
    if (this.powerDirection) {
      this.powerPoints -= 2

      if (this.powerPoints < 0) {
        this.powerPoints = 0
        this.power.isVisible = false
        this.powerHud.isVisible = false
        this.noteReadingExercise.isVisible = false
        this.isCheckingForInterval = false
        store.updateState({ volume: 0.79 })
        this.pushMessage(2, false)
      }
    } else {
      this.powerPoints += 0.65

      if (this.powerPoints > 100) {
        this.powerPoints = 100
        this.powerDirection = true
      }
    }
  }

  this.messageFrameCount += 1

  if (this.messageFrameCount === 70) {
    if (!this.stickMessage) {
      this.isFrameVisible = false
    }
  }

  this.message.isVisible = this.frameOffset === 0
  this.enemy.isVisible = this.isAttackAnimationPlaying && this.attackAnimationFrames > 5 && this.attackAnimationFrames < 30 ? this.flickerFrame > 1 : true
  this.player.isVisible = this.isAttackedAnimationPlaying && this.attackAnimationFrames > 5 && this.attackAnimationFrames < 30 ? this.flickerFrame > 1 : true
  this.flickerFrame = (this.flickerFrame + 1) % 4
  
  // Draw
  this.background.draw()
  this.enemy.draw()
  this.player.draw()
  this.frame.draw()
  this.message.draw()
  this.playerHud.draw()
  this.enemyHud.draw()
  this.enemyHealth.draw(Math.round(this.enemyHP / 100 * 96), 3)
  this.playerHealth.draw(Math.round(playerHP / 100 * 96), 3)
  ctx.fillStyle = 'white'
  ctx.font = '16px PixelOperator-Bold'
  ctx.fillText(`${Math.round(this.enemyHP)}/100`, 0, 13)
  ctx.fillText(`${Math.round(playerHP)}/100`, 201, this.frameOffset + 165)
  this.powerHud.draw()
  this.power.draw(Math.round(this.powerPoints / 100 * 42), 3)
  this.noteReadingExercise.draw()
  this.sightReadingExercise.draw()

  if (this.isCheckingForInterval) {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 167, 256, 17)

    ctx.fillStyle = 'white'
    const prompt = `Play a ${this.intervalsVerbose[this.currentInterval]}`
    ctx.fillText(prompt, 70, 180)
  }

  if (this.timerFrames !== 0) {
    this.timer.draw(Math.round((this.timerFrames / 420) * 236), 6)
  }
}

Battle.prototype.pushMessage = function(msg, stick) {
  this.isFrameVisible = true
  this.messageFrameCount = 0
  this.message.currentTexture = msg
  this.stickMessage = stick

  switch (msg) {
    case 1:
      store.updateState({ shouldEnd: true })
      break
    case 2:
      this.missSfx.play()
      break
    case 4:
      this.dodgeSfx.play()
      break
    case 5:
      this.defeatSfx.play()
  }
}

Battle.prototype.startDefend = function() {
  this.playedNotes = []
  this.pushMessage(3, true)
  store.updateState({ songID: 2 })
  this.sightReadingExercise.isVisible = true
  this.timer.isVisible = true
  this.timerFrames = 420
}

Battle.prototype.runAttackAnimation = function() {
  if (this.powerPoints > 95) {
    this.enemyHP -= this.powerPoints / 4
  } else {
    this.enemyHP -= this.powerPoints / 7
  }

  if (this.enemyHP < 0) {
    this.enemyHP = 0
  }
  
  this.attackAnimationFrames = 0
  this.isAttackAnimationPlaying = true
}

Battle.prototype.loadResources = function() {
  return Promise.all([
    new Promise((resolve, reject) => {
      this.crashSfx = new Pizzicato.Sound('/resources/soundEffects/crash.wav', resolve)
    }),
    new Promise((resolve, reject) => {
      this.swordSfx = new Pizzicato.Sound('/resources/soundEffects/sword.wav', resolve)
    }),
    new Promise((resolve, reject) => {
      this.dodgeSfx = new Pizzicato.Sound('/resources/soundEffects/dodge.wav', resolve)
    }),
    new Promise((resolve, reject) => {
      this.defeatSfx = new Pizzicato.Sound({
        source: 'file',
        options: {
          path: '/resources/soundEffects/defeat.wav',
          volume: 0.55
        }
      }, resolve)
    }),
    new Promise((resolve, reject) => {
      this.missSfx = new Pizzicato.Sound({
        source: 'file',
        options: {
          path: '/resources/soundEffects/miss.wav',
          volume: 1
        }
      }, resolve)
    }),
    this.background.load(),
    this.frame.load(),
    this.message.load(),
    this.enemy.load(),
    this.player.load(),
    this.playerHud.load(),
    this.enemyHud.load(),
    this.playerHealth.load(),
    this.enemyHealth.load(),
    this.powerHud.load(),
    this.power.load(),
    this.noteReadingExercise.load(),
    this.sightReadingExercise.load(),
    this.timer.load()
  ])
}

module.exports = Battle