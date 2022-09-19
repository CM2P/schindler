// import styles
import '@/styles/index.scss'

import { UI } from '@/js/UI'
import { Prediction } from './js/Prediction'

import camConfig from '@/js/CameraConfig'

// store a reference to the player video
var playerVideo

// keep track of scores
var player1Score = 0,
  player2Score = 0

const urlParams = new URLSearchParams(window.location.search)
const liftId = urlParams.get('liftId')

var roomUuid = null

// setup & initialization
async function onInit() {
  roomUuid = await getRoomUuid()

  UI.init()

  const videoPromise = UI.initPlayerVideo(camConfig)
  const predictPromise = Prediction.init()

  console.log('Initialize game...')

  Promise.all([videoPromise, predictPromise]).then((result) => {
    // result[0] will contain the initialized video element
    playerVideo = result[0]
    playerVideo.play()

    console.log('Initialization finished')

    UI.transitionToSecondPage()

    // start game
    playOneRound()
  })
}
//-----

// game logic
// -----------------------------------------------------------------------------

async function playOneRound() {
  // hide the timer circle
  UI.showTimer(false)
  UI.setTimerProgress(0)
  UI.setPlayerGesture('')

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
            UI.setPlayerGesture(playerGesture)
            lastGesture = playerGesture
            gestureDuration = 0
          }
        } else {
          UI.setPlayerGesture(false)
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
          checkResult(playerGesture)
        }
      })
    }, 0)
  }

  predictNonblocking()
}

async function checkResult(playerGesture) {
  var game = await play(roomUuid, playerGesture)
  var playerGesture
  var remoteGesture

  if (liftId === game.player1LiftId) {
    playerGesture = game.player1Gesture
    remoteGesture = game.player2Gesture
  } else {
    playerGesture = game.player2Gesture
    remoteGesture = game.player1Gesture
  }

  UI.setPlayerGesture(playerGesture)
  UI.showRemoteHand(true)
  UI.setRemoteGesture(remoteGesture)

  if (game.player1Score != null) UI.setPlayerScore(game.player1Score)

  if (game.player2Score != null) UI.setRemoteScore(game.player2Score)

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
