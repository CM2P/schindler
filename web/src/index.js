// import styles
import '@/styles/index.scss'

import { UI } from '@/js/UI'
import { Prediction } from './js/Prediction'

import camConfig from '@/js/CameraConfig'

// store a reference to the player video
var playerVideo

// keep track of scores
var playerScore = 0,
  remoteScore = 0

// setyp & initialization
// -----------------------------------------------------------------------------
async function onInit() {
  UI.init()
  UI.setStatusMessage('Initializing - Please wait a moment')

  const videoPromise = UI.initPlayerVideo(camConfig)
  const predictPromise = Prediction.init()

  console.log('Initialize game...')

  Promise.all([videoPromise, predictPromise]).then((result) => {
    // result[0] will contain the initialized video element
    playerVideo = result[0]
    playerVideo.play()

    console.log('Initialization finished')

    // game is ready
    waitForPlayer()
  })
}
//-----

// game logic
// -----------------------------------------------------------------------------
function waitForPlayer() {
  // show a blinking start message
  if (UI.isMobile()) {
    UI.setStatusMessage('Touch the screen to start')
  } else {
    UI.setStatusMessage('Press any key to start')
  }

  UI.startAnimateMessage()

  const startGame = () => {
    UI.stopAnimateMessage()
    playOneRound()
  }

  // wait for player to press any key
  // then stop blinking and play one round
  if (UI.isMobile()) {
    document.addEventListener('touchstart', startGame, { once: true })
  } else {
    window.addEventListener('keypress', startGame, { once: true })
  }
}

async function playOneRound() {
  // hide the timer circle
  UI.showTimer(false)
  UI.setTimerProgress(0)
  UI.setPlayerHand('')

  // ready - set - show
  // wait for countdown to finish
  await UI.startCountdown()

  // show the timer circle
  UI.showTimer(true)

  // start detecting player gestures
  // required duration 150ms ~ 4-5 camera frames
  detectPlayerGesture(150)
}

function detectPlayerGesture(requiredDuration) {
  let lastGesture = ''
  let gestureDuration = 0

  const predictNonblocking = () => {
    setTimeout(() => {
      const predictionStartTS = Date.now()

      // predict gesture (require high confidence)
      Prediction.predictGesture(playerVideo, 9).then((playerGesture) => {
        if (playerGesture != '') {
          if (playerGesture == lastGesture) {
            // player keeps holding the same gesture
            // -> keep timer running
            const deltaTime = Date.now() - predictionStartTS
            gestureDuration += deltaTime
          } else {
            // detected a different gesture
            // -> reset timer
            UI.setPlayerHand(playerGesture)
            lastGesture = playerGesture
            gestureDuration = 0
          }
        } else {
          UI.setPlayerHand(false)
          lastGesture = ''
          gestureDuration = 0
        }

        if (gestureDuration < requiredDuration) {
          // update timer and repeat
          UI.setTimerProgress(gestureDuration / requiredDuration)
          predictNonblocking()
        } else {
          // player result available
          // -> stop timer and check winner
          UI.setTimerProgress(1)
          UI.animatePlayerHand()

          // let remote make its move
          const remoteGesture = getRandomGesture()

          // check the game result
          checkResult(playerGesture, remoteGesture)
        }
      })
    }, 0)
  }

  predictNonblocking()
}

function checkResult(playerGesture, remoteGesture) {
  let statusText
  let playerWins = false
  let remoteWins = false

  if (playerGesture == remoteGesture) {
    // draw
    statusText = "It's a draw!"
  } else {
    // check whinner
    if (playerGesture == 'rock') {
      if (remoteGesture == 'scissors') {
        playerWins = true
        statusText = 'Rock beats scissors'
      } else {
        remoteWins = true
        statusText = 'Paper beats rock'
      }
    } else if (playerGesture == 'paper') {
      if (remoteGesture == 'rock') {
        playerWins = true
        statusText = 'Paper beats rock'
      } else {
        remoteWins = true
        statusText = 'Scissors beat paper'
      }
    } else if (playerGesture == 'scissors') {
      if (remoteGesture == 'paper') {
        playerWins = true
        statusText = 'Scissors beat paper'
      } else {
        remoteWins = true
        statusText = 'Rock beats scissors'
      }
    }
  }

  if (playerWins) {
    playerScore++
    statusText += ' - You win!'
  } else if (remoteWins) {
    remoteScore++
    statusText += ' - The other wins!'
  }

  UI.showRemoteHand(true)
  UI.setRemoteGesture(remoteGesture)

  UI.setStatusMessage(statusText)

  UI.setPlayerScore(playerScore)
  UI.setRemoteScore(remoteScore)

  // wait for 3 seconds, then start next round
  setTimeout(playOneRound, 3000)
}

function getRandomGesture() {
  const gestures = ['rock', 'paper', 'scissors']
  const randomNum = Math.floor(Math.random() * gestures.length)
  return gestures[randomNum]
}
//-----

onInit()
