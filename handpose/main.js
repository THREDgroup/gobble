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
let canvas2 = document.getElementById("better");
let ctx2 = canvas2.getContext('2d');

async function get_landmarks() {

    let datastream = capture.toDataURL("image/png");

    console.log(datastream);

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
                keypoints = predictions[0].landmarks;
                drawKeypoints(predictions[0].landmarks, ctx);

                // Resize canvas 2
                canvas2.width = capture.width;
                canvas2.height = capture.height;

                // Add clip to canvas 2
                clip_image(ctx2);

                let newImage = new Image();
                newImage.src = datastream;
                newImage.onload =function() {
                    ctx2.drawImage(newImage, 0, 0);
                    drawKeypoints(predictions[0].landmarks, ctx2);
                    let newImage2 = new Image();
                    newImage2.src = canvas2.toDataURL( "image/png" );
                    lc.saveShape(LC.createShape('Image', {x: 10, y: 10, image: newImage2}));
                };

            } else {
                console.log("No hand, try again");
            }

        }
    )

}

function clip_image(ctx) {
    // Compute radius
    let r = Math.sqrt(Math.pow((keypoints[5][0]-keypoints[9][0]), 2) + Math.pow((keypoints[5][1]-keypoints[9][1]), 2))*0.5;

    // Clip palm
    ctx.beginPath();
    ctx.lineWidth = 2;
    clip_polygon([0, 1, 2, 5, 9, 13, 17, 0], r, ctx);

    // Clip fingers
    clip_polygon(fingerLookupIndices.indexFinger, r, ctx)
    clip_polygon(fingerLookupIndices.middleFinger, r, ctx)
    clip_polygon(fingerLookupIndices.ringFinger, r, ctx)
    clip_polygon(fingerLookupIndices.pinky, r, ctx)
    // clip_polygon([1, 2], r, ctx)
    clip_polygon([2, 3], r, ctx)
    clip_polygon([3, 4], r, ctx)
    // clip_polygon(fingerLookupIndices.indexFinger.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.middleFinger.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.ringFinger.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.pinky.slice(1,5), r, ctx)
    // clip_polygon(fingerLookupIndices.thumb.slice(2,5), r, ctx)

    ctx.clip();

}

function clip_polygon(idxs, r, ctx) {
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

function draw_polygon(points, ctx) {

}

function drawPoint(y, x, r, ctx) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawKeypoints(keypoints, ctx) {
    const keypointsArray = keypoints;

    for (let i = 0; i < keypointsArray.length; i++) {
        const y = keypointsArray[i][0];
        const x = keypointsArray[i][1];
        drawPoint(x - 2, y - 2, 3, ctx);
    }

    const fingers = Object.keys(fingerLookupIndices);
    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i];
        const points = fingerLookupIndices[finger].map(idx => keypoints[idx]);
        drawPath(points, false, ctx);
    }
}

function drawPath(points, closePath, ctx) {
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
