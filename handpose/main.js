let stream = null;

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

let videoWidth, videoHeight, rafID, ctx, canvas, ANCHOR_POINTS,
    fingerLookupIndices = {
        thumb: [0, 1, 2, 3, 4],
        indexFinger: [0, 5, 6, 7, 8],
        middleFinger: [0, 9, 10, 11, 12],
        ringFinger: [0, 13, 14, 15, 16],
        pinky: [0, 17, 18, 19, 20]
    };  // for rendering each finger as a polyline

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 500;
const mobile = isMobile();
// Don't render the point cloud on mobile in order to maximize performance and
// to avoid crowding limited screen space.

const state = {
    backend: 'webgl'
};


function drawPoint(y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

// function drawToLiterallyCanvas(keypoints) {
//     drawKeypoints(keypoints);
//     let newImage2 = new Image();
//     newImage2.src = canvas.toDataURL("image/png");
//     newImage2.onload =function() {
//                     ctx.drawImage(newImage, 0, 0);
//                     drawKeypoints(predictions[0].landmarks, ctx2);
//                     let newImage2 = new Image();
//                     newImage2.src = canvas2.toDataURL( "image/png" );
//                     lc.saveShape(LC.createShape('Image', {x: 10, y: 10, image: newImage2}));
//                 };
// }

function drawKeypoints(keypoints) {
    const keypointsArray = keypoints;

    for (let i = 0; i < keypointsArray.length; i++) {
        const y = keypointsArray[i][0];
        const x = keypointsArray[i][1];
        drawPoint(x - 2, y - 2, 3);
    }

    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i];
        const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
        drawPath(points, false);
    }
}

function drawPath(points, closePath) {
    const region = new Path2D();
    region.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        region.lineTo(point[0], point[1]);
    }

    if (closePath) {
        region.closePath();
    }
    ctx.stroke(region);
}

let model;

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            'Browser API navigator.mediaDevices.getUserMedia not available');
    }

    const video = document.getElementById('video');
    stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: mobile ? undefined : VIDEO_WIDTH,
            height: mobile ? undefined : VIDEO_HEIGHT
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadVideo() {
    const video = await setupCamera();
    $("#spinner").html("");
    video.play();
    return video;
}

async function main() {
    await tf.setBackend(state.backend);
    model = await handpose.load();
    let video;

    try {
        video = await loadVideo();
    } catch (e) {
        let info = document.getElementById('info');
        info.textContent = e.message;
        info.style.display = 'block';
        throw e;
    }

    // setupDatGui();

    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;

    canvas = document.getElementById('output');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, videoWidth, videoHeight);
    ctx.strokeStyle = 'red';
    ctx.fillStyle = 'red';

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // These anchor points allow the hand pointcloud to resize according to its
    // position in the input.
    ANCHOR_POINTS = [
        [0, 0, 0], [0, -VIDEO_HEIGHT, 0], [-VIDEO_WIDTH, 0, 0],
        [-VIDEO_WIDTH, -VIDEO_HEIGHT, 0]
    ];


    landmarksRealTime(video);
}

const landmarksRealTime = async (video) => {
    async function frameLandmarks() {
        console.log("still going");
        canvas.width = videoWidth;
        // lc.clear();
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
            const result = predictions[0].landmarks;
            clip_image(result);
        }

        ctx.drawImage(
            video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width,
            canvas.height);

        if (predictions.length > 0) {
            const result = predictions[0].landmarks;
            drawKeypoints(result);
        }

        rafID = requestAnimationFrame(frameLandmarks);
    }

    frameLandmarks();
};


let btnCapture = document.getElementById( "btn-capture" );
btnCapture.addEventListener( "click", captureSnapshot );

function captureSnapshot() {
    let newImage2 = new Image();
    newImage2.src = canvas.toDataURL( "image/png" );
    lc.saveShape(LC.createShape('Image', {x: 10, y: 10, image: newImage2}));
    stream.getTracks()[0].stop()
}


navigator.getUserMedia = navigator.getUserMedia ||
    navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

main();


function clip_image(keypoints) {
    // Compute radius
    let r = Math.sqrt(Math.pow((keypoints[5][0]-keypoints[9][0]), 2) + Math.pow((keypoints[5][1]-keypoints[9][1]), 2))*0.5;

    // Clip palm
    ctx.beginPath();
    ctx.lineWidth = 2;
    clip_polygon(keypoints, [0, 1, 2, 5, 9, 13, 17, 0], r, ctx);

    // Clip fingers
    clip_polygon(keypoints, fingerLookupIndices.indexFinger, r, ctx)
    clip_polygon(keypoints, fingerLookupIndices.middleFinger, r, ctx)
    clip_polygon(keypoints, fingerLookupIndices.ringFinger, r, ctx)
    clip_polygon(keypoints, fingerLookupIndices.pinky, r, ctx)
    // clip_polygon([1, 2], r, ctx)
    clip_polygon(keypoints, [2, 3], r, ctx)
    clip_polygon(keypoints, [3, 4], r, ctx)
    // clip_polygon(fingerLookupIndices.indexFinger.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.middleFinger.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.ringFinger.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.pinky.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.thumb.slice(2,5), r, ctx)

    ctx.clip();

}

function clip_polygon(keypoints, idxs, r, ctx) {
    // Get points
    let points = []
    for (let i=0; i < idxs.length; i++) {
        points.push([keypoints[idxs[i]][0], keypoints[idxs[i]][1]])
    }

    // Make points
    let offset = new Offset();
    let pts = offset.data(points).margin(r)[0];

    // Draw polygon
    ctx.moveTo(pts[0][0], pts[0][1])
    for (let i=1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.stroke();

}
