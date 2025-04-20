let video;
let bodyPose;
let poses = [];
let connections;
let hand;
let hands = [];
let handPose;
let painting;
let navigationMode = false;
let handDirection;
let palmLength;
function preload() {
	bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
	handPose = ml5.handPose({ flipped: true });
}
function mousePressed() {
	console.log(poses);
}
function setup() {
	let canvas = createCanvas(640, 480);
	canvas.parent("canvas-container");
	video = createCapture(VIDEO, { flipped: true });
	video.hide();
	bodyPose.detectStart(video, gotPoses);
	handPose.detectStart(video, gotHands);
	connections = bodyPose.getSkeleton();
	let navigationButton = select("#navigation-button");
	navigationButton.mousePressed(toggleNavigationMode);
}
function gotPoses(results) {
	poses = results;
}
function gotHands(results) {
	hands = results;
}

function draw() {
	image(video, 0, 0);
	if (poses.length > 0) {
		let pose = poses[0];
		for (let [pt1, pt2] of connections) {
			let keypointPt1 = pose.keypoints[pt1];
			let keypointPt2 = pose.keypoints[pt2];
			stroke(0, 255, 0);
			strokeWeight(5);
			if (keypointPt1.confidence > 0.1 && keypointPt2.confidence > 0.1) {
				line(
					keypointPt1.x,
					keypointPt1.y,
					keypointPt2.x,
					keypointPt2.y
				);
			}
		}
		for (let keypoint of pose.keypoints) {
			fill(255, 0, 0);
			if (keypoint.confidence > 0.1) {
				circle(keypoint.x, keypoint.y, 20);
			}
		}
	}
	if (navigationMode) {
		hand = hands[0];
		if (hands.length > 0) {
			textSize(40);
			stroke(0, 255, 0);
			fill(0, 0, 255);
			let fingerState = determineFingerState(hand);
			handDirection = determineHandDirection(9);
			palmLength = dist(
				hand.keypoints[5].x,
				hand.keypoints[5].y,
				hand.keypoints[17].x,
				hand.keypoints[17].y
			);
			if (palmLength < 20) {
				let fistLength = dist(
					hand.keypoints[0].x,
					hand.keypoints[0].y,
					hand.keypoints[9].x,
					hand.keypoints[9].y
				);
				palmLength = fistLength * 0.8;
			}
			if (fingerState == "10000") {
				text("Gesture : Pointing-" + `${handDirection}`, 30, 30);
				reDirectTo(handDirection);
			}
		}
	}
}
function toggleNavigationMode() {
	navigationMode = !navigationMode;
	let navigationButton = select("#navigation-button");

	if (navigationMode) {
		navigationButton.html("Disable Navigation Mode");
		navigationButton.style("background-color", "#f44336");
	} else {
		navigationButton.html("Enable Navigation Mode");
		navigationButton.style("background-color", "#507c89");
	}
}
function determineFingerState(hand) {
	let index_curl =
		dist(
			hand.keypoints[0].x,
			hand.keypoints[0].y,
			hand.keypoints[8].x,
			hand.keypoints[8].y
		) /
			palmLength <
		1.875;
	let midfinger_curl =
		dist(
			hand.keypoints[0].x,
			hand.keypoints[0].y,
			hand.keypoints[12].x,
			hand.keypoints[12].y
		) /
			palmLength <
		2.125;
	let ringfinger_curl =
		dist(
			hand.keypoints[0].x,
			hand.keypoints[0].y,
			hand.keypoints[16].x,
			hand.keypoints[16].y
		) /
			palmLength <
		1.875;
	let pinky_curl =
		dist(
			hand.keypoints[0].x,
			hand.keypoints[0].y,
			hand.keypoints[20].x,
			hand.keypoints[20].y
		) /
			palmLength <
		1.75;
	let thumb_curl =
		dist(
			hand.keypoints[5].x,
			hand.keypoints[5].y,
			hand.keypoints[4].x,
			hand.keypoints[4].y
		) < palmLength &&
		dist(
			hand.keypoints[13].x,
			hand.keypoints[13].y,
			hand.keypoints[4].x,
			hand.keypoints[4].y
		) < palmLength;
	let fingerState = [
		index_curl,
		midfinger_curl,
		ringfinger_curl,
		pinky_curl,
		thumb_curl,
	]
		.map((val) => (val ? "0" : "1"))
		.join("");
	return fingerState;
}
function determineHandDirection(point) {
	let handDirectionX = hand.keypoints[0].x - hand.keypoints[point].x;
	let handDirectionY = hand.keypoints[0].y - hand.keypoints[point].y;

	if (Math.abs(handDirectionX) > Math.abs(handDirectionY)) {
		handDirection = handDirectionX > 0 ? "left" : "right";
	} else {
		handDirection = handDirectionY > 0 ? "up" : "down";
	}

	return handDirection;
}
function reDirectTo(ref) {
	if (ref == "up") {
		window.open("../gesture.html", "_self");
	} else if (ref == "left") {
		window.open("../drawing.html", "_self");
	} else if (ref == "right") {
		window.open("../music.html", "_self");
	}
}
