// getting dom elements
var remoteVideo = document.getElementById('remote-video')
var canvas = document.getElementById('player-video')

// variables
var roomUuid
var localStream
var remoteStream
var rtcPeerConnection
var isCaller

// setup queue
const urlParams = new URLSearchParams(window.location.search)
const liftId = urlParams.get('liftId')

// STUN servers are used by both clients to determine their IP
// address as visible by the global Internet.If both the peers
// are behind the same NAT , STUN settings are not needed since
// they are anyways reachable form each other . STUN effectively comes
// into play when the peers are on different networks.

// As we know that webRTC is peer to peer and the ice candidates are mandatory
// in webrtc. ICE functionality can be in any of the two ways , STUN and TURN .

// There are many stun servers provided by google and other sites which one could use .
// You can also setup your own STUn server according to rfc5766.
const iceServers = {
  iceServers: [
      {
        urls: "stun:openrelay.metered.ca:80",
      },
      {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
      {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
      },
    ],
}
const streamConstraints = { audio: false, video: true }
const mtcnnForwardParams = {
  // limiting the search space to larger faces for webcam detection
  minFaceSize: 200,
}

//positions for sunglasess
var results = []

function get_random(list) {
  return list[Math.floor(Math.random() * list.length)]
}
var wears = ['img/sunglasses.png', 'img/sunglasses1.png', 'img/fullface1.png', 'img/fullface2.png']

//utility functions
async function getFace(localVideo, options) {
  results = await faceapi.mtcnn(localVideo, options)
}

const hostname = window.location.hostname.replace('dev', 'backend').replace('prod', 'backend')
const port = window.location.hostname === 'localhost' ? ':3000' : ''

const apiUrl = `${window.location.protocol}//${hostname}${port}`

// Let's do this
var socket = io(apiUrl)

async function getRoomUuid(liftId) {
  const result = await fetch(`${apiUrl}/queue?liftId=${liftId}`)
  if (result.ok) {
    roomUuid = await result.text()
    socket.emit('create or join', roomUuid)

    return roomUuid
  } else {
    alert(result.body)
  }
}

async function play(liftId, roomUuid, playerGesture) {
  const result = await fetch(
    `${apiUrl}/player?liftId=${liftId}&roomUuid=${roomUuid}&playerGesture=${playerGesture}`
  )
  if (result.ok) {
    return result.text()
  } else {
    alert(result.body)
  }
}

// message handlers
socket.on('created', async function (room) {
  const wear = get_random(wears)

  await faceapi.loadMtcnnModel('/weights')
  await faceapi.loadFaceRecognitionModel('/weights')
  navigator.mediaDevices
    .getUserMedia(streamConstraints)
    .then(function (stream) {
      let localVideo = document.createElement('video')
      localVideo.srcObject = stream
      localVideo.autoplay = true
      localVideo.addEventListener('playing', () => {
        let ctx = canvas.getContext('2d')
        let image = new Image()

        image.src = wear

        var x = 15
        var y = 30
        if (wear.includes('fullface')) {
          x = 15
          y = -5
        }

        function step() {
          getFace(localVideo, mtcnnForwardParams)
          ctx.drawImage(localVideo, 0, 0)
          results.map((result) => {
            ctx.drawImage(
              image,
              result.faceDetection.box.x + x,
              result.faceDetection.box.y + y,
              result.faceDetection.box.width,
              result.faceDetection.box.width * (image.height / image.width)
            )
          })
          requestAnimationFrame(step)
        }

        requestAnimationFrame(step)
      })

      localStream = canvas.captureStream(30)
      isCaller = true
    })
    .catch(function (err) {
      console.log('An error ocurred when accessing media devices', err)
    })
})

socket.on('joined', async function (room) {
  await faceapi.loadMtcnnModel('/weights')
  await faceapi.loadFaceRecognitionModel('/weights')
  navigator.mediaDevices
    .getUserMedia(streamConstraints)
    .then(function (stream) {
      let localVideo = document.createElement('video')
      localVideo.srcObject = stream
      localVideo.autoplay = true
      localVideo.addEventListener('playing', () => {
        let ctx = canvas.getContext('2d')
        let image = new Image()
        image.src = 'img/sunglasses-style.png'

        function step() {
          getFace(localVideo, mtcnnForwardParams)
          ctx.drawImage(localVideo, 0, 0)
          results.map((result) => {
            ctx.drawImage(
              image,
              result.faceDetection.box.x,
              result.faceDetection.box.y + 30,
              result.faceDetection.box.width,
              result.faceDetection.box.width * (image.height / image.width)
            )
          })
          requestAnimationFrame(step)
        }

        requestAnimationFrame(step)
      })

      localStream = canvas.captureStream(30)
      socket.emit('ready', roomUuid)
    })
    .catch(function (err) {
      console.log('An error ocurred when accessing media devices', err)
    })
})

socket.on('candidate', function (event) {
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  })
  rtcPeerConnection.addIceCandidate(candidate)
})

socket.on('ready', function () {
  console.log('socket ready!')
  if (isCaller) {
    console.log('ready isCaller!')
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = onIceCandidate

    // Listen for connectionstatechange on the local RTCPeerConnection
    rtcPeerConnection.addEventListener('connectionstatechange', (event) => {
      if (rtcPeerConnection.connectionState === 'connected') {
        console.log('Peers connected!')
      }
    })

    rtcPeerConnection.onaddstream = onAddStream
    rtcPeerConnection.addStream(localStream)
    rtcPeerConnection.createOffer(setLocalAndOffer, function (e) {
      console.log(e)
    })
  }
})

socket.on('offer', function (event) {
  console.log('offer')
  if (!isCaller) {
    console.log('offer isCaller')
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    rtcPeerConnection.onicecandidate = onIceCandidate
    rtcPeerConnection.onaddstream = onAddStream
    rtcPeerConnection.addStream(localStream)
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    rtcPeerConnection.createAnswer(setLocalAndAnswer, function (e) {
      console.log(e)
    })
  }
})

socket.on('answer', function (event) {
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})

// handler functions
function onIceCandidate(event) {
  if (event.candidate) {
    console.log('sending ice candidate')
    socket.emit('candidate', {
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      room: roomUuid,
    })
  }
}

function onAddStream(event) {
  remoteVideo.srcObject = event.stream
  remoteStream = event.stream
}

function setLocalAndOffer(sessionDescription) {
  rtcPeerConnection.setLocalDescription(sessionDescription)
  socket.emit('offer', {
    type: 'offer',
    sdp: sessionDescription,
    room: roomUuid,
  })
}

function setLocalAndAnswer(sessionDescription) {
  rtcPeerConnection.setLocalDescription(sessionDescription)
  socket.emit('answer', {
    type: 'answer',
    sdp: sessionDescription,
    room: roomUuid,
  })
}
