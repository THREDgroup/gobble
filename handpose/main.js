// Started here: https://github.com/tensorflow/tfjs-models/tree/master/handpose

let keypoints = [];

fingerLookupIndices = {
      thumb: [0, 1, 2, 3, 4],
      indexFinger: [0, 5, 6, 7, 8],
      middleFinger: [0, 9, 10, 11, 12],
      ringFinger: [0, 13, 14, 15, 16],
      pinky: [0, 17, 18, 19, 20]
    };

let ctx = capture.getContext( '2d' );

async function get_landmarks() {


    // Load the MediaPipe handpose model.
    const model = await handpose.load();
    // Pass in a video stream (or an image, canvas, or 3D tensor) to obtain a
    // hand prediction from the MediaPipe graph.
    // const predictions = await model.estimateHands(document.querySelector("video"));

    console.log("doing a predict");
    model.estimateHands(capture).then(
        function (predictions) {
            console.log(predictions);
            if (predictions.length > 0) {

                console.log(predictions);

                keypoints = predictions[0].landmarks;

                drawKeypoints(predictions[0].landmarks, ctx);

                // let save = capture.toDataURL( "image/png" );
                // ctx.clearRect(0, 0, capture.width, capture.height);
                // clip_drawings(keypoints);
                // let tmp = new Image();
                // tmp.src = save;
                // ctx.drawImage(tmp, 0, 0);


                let newImage = new Image();
                newImage.src = capture.toDataURL( "image/png" );
                lc.saveShape(LC.createShape('Image', {x: 10, y: 10, image: newImage}));

            } else {
                console.log("No hand, try again");
            }

        }
    )

}

function clip_drawings(keypoints) {
    let bounding = [0, 1, 2, 3, 4,8, 12, 16, 20, 19, 18, 17]
    ctx.beginPath();
    ctx.moveTo(keypoints[bounding[0]][0], keypoints[bounding[0]][1]);

    for (let i = 1; i < bounding.length; i++) {
        ctx.lineTo(keypoints[bounding[i]][0], keypoints[bounding[i]][1]);
    }
    ctx.closePath();
    ctx.clip();
}


function drawPoint(y, x, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

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
