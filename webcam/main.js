// Started from here: https://html5.tutorials24x7.com/blog/how-to-capture-image-from-camera

// The buttons to start & stop stream and to capture the image
var btnStart = document.getElementById( "btn-start" );
var btnStop = document.getElementById( "btn-stop" );
var btnCapture = document.getElementById( "btn-capture" );

// The stream & capture
var stream = document.getElementById( "stream" );
var capture = document.getElementById( "capture" );
var streamjq = $( "#stream" );
var capturejq = $( "#capture" );

// The video stream
var cameraStream = null;

// Attach listeners
btnStart.addEventListener( "click", startStreaming );
btnStop.addEventListener( "click", stopStreaming );
btnCapture.addEventListener( "click", captureSnapshot );


// Start Streaming
function startStreaming() {

    var mediaSupport = 'mediaDevices' in navigator;

    if( mediaSupport && null == cameraStream ) {

        navigator.mediaDevices.getUserMedia( { video: true } )
            .then( function( mediaStream ) {

                cameraStream = mediaStream;

                stream.srcObject = mediaStream;

                stream.play();
            })
            .catch( function( err ) {

                console.log( "Unable to access camera: " + err );
            });
    }
    else {

        alert( 'Your browser does not support media devices.' );

        return;
    }
}

// Stop Streaming
function stopStreaming() {

    if( null != cameraStream ) {

        var track = cameraStream.getTracks()[ 0 ];

        track.stop();
        stream.load();

        cameraStream = null;
    }
}

function captureSnapshot() {

    if( null != cameraStream ) {
        // Set width and height
        let width = streamjq.width();
        let height = streamjq.height();

        capture.width = width;
        capture.height = height;

        capturejq.removeClass("d-none");
        streamjq.addClass("d-none");

        let ctx = capture.getContext( '2d' );

        ctx.drawImage( stream, 0, 0, capture.width, capture.height );

        stopStreaming();

        get_landmarks();


    }
}