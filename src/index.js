const teoria = require('teoria')
const piu = require('piu')
const Tone = require('tone')
const Pizzicato = require('pizzicato')
const midifreq = require('midi-freq')

const TitleScreen = require('./scenes/TitleScreen')
const Battle = require('./scenes/Battle')
const Win = require('./scenes/Win')
const store = require('./store')

const KEY_DOWN = 144
const KEY_UP = 128

// Load music
const battleMusic = new Pizzicato.Sound({
  source: 'file',
  options: {
    path: '/resources/music/battle.wav',
    loop: true,
    volume: 0.79
  }
})

const winMusic = new Pizzicato.Sound({
  source: 'file',
  options: {
    path: '/resources/music/win.wav',
    volume: 0.79
  }
})

const menuMusic = new Pizzicato.Sound({
  source: 'file',
  options: {
    path: '/resources/music/menu.wav',
    volume: 0.79
  }
})

const battleDefendMusic = new Pizzicato.Sound('/resources/music/battleDefend.wav')

// Debug buttons
/* document.getElementById('b1').onclick = () => store.updateState({ chord: 'Cm'})
document.getElementById('b2').onclick = () => store.updateState({ chord: 'C' })
document.getElementById('b3').onclick = () => store.updateState({ note: '60' }) */

let testSynth;

document.getElementById('b4').onclick = () => {
  testSynth = new Tone.PolySynth(6, Tone.Synth, {
    "oscillator": {
      type: "pwm"
    },
    volume: -12
  }).toMaster()
}

document.getElementById('b5').onclick = () => {
  testSynth.triggerAttackRelease(midifreq(440, 60), '16n')
}

document.getElementById('startGameButton').onclick = () => {
  document.getElementById('startGameButton').disabled = 'true'
  startGame()
}

// Intialize scenes
const titleScreen = new TitleScreen()
const battle = new Battle()
const win = new Win()

function doFrame() {
  const { isFirstFrame, ctx, scene, previousScene, songID, previousSongID, volume } = store.getState()
  
  ctx.clearRect(0, 0, 512, 480)

  if (scene !== previousScene) {
    store.updateState({
      previousScene: scene,
      isFirstFrame: true
    })
  }

  battleMusic.volume = volume
  
  if (songID !== previousSongID) {
    store.updateState({ previousSongID: songID })

    console.log(songID)
    switch (songID) {
      case 0:
        store.updateState({ shouldEnd: false })
        battleDefendMusic.stop()
        battleMusic.stop()
      case 1:
        battleMusic.play()
        battleDefendMusic.stop()
        break
      case 2:
        battleDefendMusic.play()
        battleMusic.pause()
        battleDefendMusic.on('end', () => {
          const { shouldEnd, playerHP } = store.getState()
          
          //console.log(shouldEnd)
          if (shouldEnd && playerHP != 0) {
            store.updateState({ songID: 1, songFinished: true })
          }
        })
        break
      case 3:
        store.updateState({ shouldEnd: false })
        battleDefendMusic.stop()
        break
      case 4:
        battleMusic.stop()
        winMusic.play()
        break
      case 5:
        winMusic.stop()
        menuMusic.play()
    }
  }

  //console.log(scene)
  switch (scene) {
    case 0:
      titleScreen.doFrame()
      break
    case 1:
      battle.doFrame()
      break
    case 2:
      win.doFrame()
      break
  }

  if (isFirstFrame) {
    store.updateState({ isFirstFrame: false })
  }

  store.updateState({
    note: null,
    chord: null,
    noteName: null,
    interval: null,
    songFinished: false
  })

  window.requestAnimationFrame(doFrame)
}

// Don't do frames until assets are loaded
function startGame() {
  const { scene, ctx } = store.getState()

  ctx.fillStyle = 'white'
  ctx.font = '16px PixelOperator-Bold'
  ctx.fillText('Loading...', 0, 10)

  Promise.all([
    titleScreen.loadResources(), 
    battle.loadResources(),
    win.loadResources()
  ]).then(() => {
    navigator.requestMIDIAccess({ sysex: false }).then(midiAccess => {
      console.log(midiAccess)
      
      window.requestAnimationFrame(doFrame)
      
      const inputs = midiAccess.inputs.values()

      const synth = new Tone.PolySynth(6, Tone.Synth, {
        "oscillator": {
          type: "pwm"
        }
      }).toMaster()
  
      synth.volume.value = -9

      let notes = []

      for (const input of inputs) {
        input.onmidimessage = message => {
          const [command, note] = message.data

          if (command === KEY_UP) {
            notes = []
          }

          if (command === KEY_DOWN) {
            // Play note sound
            const { scene } = store.getState()
            
            if (scene !== 0) {
              synth.triggerAttackRelease(midifreq(440, note), '16n')
            }

            console.log(note)

            // Interval check
            notes.push(note)

            if (notes.length == 2) {
              const interval = teoria.interval(teoria.note.fromMIDI(notes[0]), teoria.note.fromMIDI(note))
              store.updateState({ interval: interval.toString() })
            }
            
            // Melody check

            // const correctNote = melody[notes.length]

            // if (note === correctNote) {
            //   notes.push(note)
            // } else {
            //   console.log('WRONG!')
            //   notes = []
            // }

            // if (notes.length === melody.length) {
            //   console.log('CORRECT!')
              
            //   notes = []
            // }
            
            // Chord check
            if (notes.length === 3) {
              try {
                store.updateState({
                  chord: getChordName(notes)
                })
              } catch (err) { } // Invalid chord, not an error
          
              notes = []
            } else {
              store.updateState({ noteName: teoria.note.fromMIDI(note).toString() })
              store.updateState({ note })
            }
          }
        }
      }
    })
  })
}

// Chord detection
function getChordName(notes) {
  const noteObjs = notes.map(num => teoria.note.fromMIDI(num))
  const chord = piu.infer(noteObjs, true)[0]

  return piu.name(chord)
}