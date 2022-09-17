const $firstPage = document.querySelector('#first-page')
const $secondPage = document.querySelector('#second-page')

const $playerScore = document.querySelector('#score1')
const $playerVideo = document.querySelector('#player-video')
const $playerHand = document.querySelector('#player-hand')

const $remoteScore = document.querySelector('#score2')
const $remoteHand = document.querySelector('#remote-hand')

const $countdown = document.querySelector('#countdown')

const $timerRing = document.querySelector('#timer-ring')
const $timerRingCircle = document.querySelector('#timer-ring-circle')
const radius = $timerRingCircle.r.baseVal.value
const circumference = radius * 2 * Math.PI

export const UI = {
  init: function () {
    this.initTimerCircle()
    this.showTimer(false)
  },

  initTimerCircle: function () {
    $timerRingCircle.style.strokeDasharray = `${circumference} ${circumference}`
    $timerRingCircle.style.strokeDashoffset = `${circumference}`
  },

  setCountdown: function (value) {
    $countdown.textContent = value
  },

  stopCountdown: function () {
    $countdown.classList.add('fade-out')
  },

  startCountdown: async function () {
    return new Promise((resolve) => {
      this.setCountdown(3)
      setTimeout(() => {
        this.setCountdown(2)
      }, 1000)
      setTimeout(() => {
        this.setCountdown(1)
      }, 2000)
      setTimeout(() => {
        this.stopCountdown()
        resolve()
      }, 3000)
    })
  },

  showTimer: function (show) {
    $timerRing.style.visibility = show ? 'visible' : 'hidden'
  },

  setTimerProgress: function (percent) {
    const offset = circumference - percent * circumference
    $timerRingCircle.style.strokeDashoffset = offset
  },

  setPlayerHand: function (gesture) {
    switch (gesture) {
      case 'rock':
        $playerHand.textContent = '✊'
        break
      case 'paper':
        $playerHand.textContent = '🤚'
        break
      case 'scissors':
        $playerHand.textContent = '✌'
        break
      default:
        $playerHand.textContent = ''
        break
    }
  },

  setPlayerScore: function (score) {
    $playerScore.textContent = score
  },

  setRemoteScore: function (score) {
    $remoteScore.textContent = score
  },

  animatePlayerHand: function () {
    $playerHand.classList.add('player-hand-zoom')
    setTimeout(() => {
      $playerHand.classList.remove('player-hand-zoom')
    }, 1000)
  },

  showRemoteHand: function (show) {
    $remoteHand.style.display = show ? 'block' : 'none'
  },

  setRemoteGesture: function (gesture) {
    switch (gesture) {
      case 'rock':
        $remoteHand.textContent = '✊'
        break
      case 'paper':
        $remoteHand.textContent = '🤚'
        break
      case 'scissors':
        $remoteHand.textContent = '✌'
        break
      default:
        $remoteHand.textContent = ''
        break
    }
  },

  initPlayerVideo: async function (constraints) {
    // get cam video stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    $playerVideo.srcObject = stream

    return new Promise((resolve) => {
      $playerVideo.onloadedmetadata = () => {
        $playerVideo.onloadeddata = () => {
          resolve($playerVideo)
        }
      }
    })
  },

  isMobile: function () {
    // remember kids: this is super unreliable
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  },

  transitionToSecondPage: function () {
    $firstPage.classList.add('fade-out')
    $secondPage.classList.add('fade-in')
    $secondPage.style.opacity = 1
  },
}
