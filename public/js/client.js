// getting dom elements
var divSelectLift = document.getElementById("selectLift");
var divConsultingLift = document.getElementById("consultingLift");
var inputLiftNumber = document.getElementById("LiftNumber");
var btnGoLift = document.getElementById("goLift");
var remoteVideo = document.getElementById("remoteVideo");
var canvas = document.getElementById("localCanvas");

// variables
var liftNumber;
var localStream;
var remoteStream;
var rtcPeerConnection;
var isCaller;

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
    'iceServers': [
        { 'url': 'stun:mtcnnRstun.services.mozilla.com' },
        { 'url': 'stun:stun.l.google.com:19302' }
    ]
}
const streamConstraints = { audio: true, video: true };
const mtcnnForwardParams = {
    // limiting the search space to larger faces for webcam detection
    minFaceSize: 200
}

//positions for sunglasess
var results = []

//utility functions
async function getFace(localVideo, options){
    results = await faceapi.mtcnn(localVideo, options)
}

// Let's do this
var socket = io();

btnGoLift.onclick = function () {
    if (inputLiftNumber.value === '') {step
        alert("Please type a lift number")
    } else {
        roomNumber = inputLiftNumber.value;
        socket.emit('create or join', liftNumber);
        divSelectLift.style = "display: none;";
        divConsultingLift.style = "display: block;";
    }
};

// message handlers
socket.on('created', async function (lift) {
    await faceapi.loadMtcnnModel('/weights')
    await faceapi.loadFaceRecognitionModel('/weights')
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
        let localVideo = document.createElement("video")
        localVideo.srcObject = stream;
        localVideo.autoplay = true
        localVideo.addEventListener('playing', () => {
            let ctx = canvas.getContext("2d");
            let image = new Image()
            image.src = "img/sunglasses.png"
            
            function step() {
                getFace(localVideo, mtcnnForwardParams)
                ctx.drawImage(localVideo, 0, 0)
                results.map(result => {
                    ctx.drawImage(
                        image,
                        result.faceDetection.box.x + 15,
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
        isCaller = true;
    }).catch(function (err) {
        console.log('An error ocurred when accessing media devices', err);
    });
});

socket.on('joined', async function (lift) {
    await faceapi.loadMtcnnModel('/weights')
    await faceapi.loadFaceRecognitionModel('/weights')
    navigator.mediaDevices.getUserMedia(streamConstraints).then(function (stream) {
        let localVideo = document.createElement("video")
        localVideo.srcObject = stream;
        localVideo.autoplay = true
        localVideo.addEventListener('playing', () => {
            let ctx = canvas.getContext("2d");
            let image = new Image()
            image.src = "img/sunglasses-style.png"

            function step() {
                getFace(localVideo, mtcnnForwardParams)
                ctx.drawImage(localVideo, 0, 0)
                results.map(result => {
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

        localStream = canvas.captureStream(30);
        socket.emit('ready', liftNumber);
    }).catch(function (err) {
        console.log('An error ocurred when accessing media devices', err);
    });
});

socket.on('candidate', function (event) {
    var candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate
    });
    rtcPeerConnection.addIceCandidate(candidate);
});

socket.on('ready', function () {
    if (isCaller) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;
        rtcPeerConnection.addStream(localStream);
        rtcPeerConnection.createOffer(setLocalAndOffer, function (e) { console.log(e) });
    }
});

socket.on('offer', function (event) {
    if (!isCaller) {
        rtcPeerConnection = new RTCPeerConnection(iceServers);
        rtcPeerConnection.onicecandidate = onIceCandidate;
        rtcPeerConnection.onaddstream = onAddStream;
        rtcPeerConnection.addStream(localStream);
        rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
        rtcPeerConnection.createAnswer(setLocalAndAnswer, function (e) { console.log(e) });
    }
});

socket.on('answer', function (event) {
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
})

// handler functions
function onIceCandidate(event) {
    if (event.candidate) {
        console.log('sending ice candidate');
        socket.emit('candidate', {
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
            lift: liftNumber
        })
    }
}

function onAddStream(event) {
    remoteVideo.srcObject = event.stream;
    remoteStream = event.stream;
}

function setLocalAndOffer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('offer', {
        type: 'offer',
        sdp: sessionDescription,
        lift: liftNumber
    });
}

function setLocalAndAnswer(sessionDescription) {
    rtcPeerConnection.setLocalDescription(sessionDescription);
    socket.emit('answer', {
        type: 'answer',
        sdp: sessionDescription,
        lift: liftNumber
    });
}