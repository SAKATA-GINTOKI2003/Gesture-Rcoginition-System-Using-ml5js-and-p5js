let video;
let hands = [];
let hand;
let handPose;
let connections;
let handDirection;
let handDirectionX;
let handDirectionY;
let handType;
let palmLength;
let navigationMode = false; // Default navigation mode state
function preload() {
	handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
	hands = results;
}

function mousePressed() {
	console.log(palmLength);
}

function setup() {
	let canvas = createCanvas(640, 480);
	canvas.parent("canvas-container");
	video = createCapture(VIDEO, { flipped: true });
	video.hide();
	handPose.detectStart(video, gotHands);
	connections = handPose.getConnections();
	let clearButton = select("#clear-button");
	clearButton.mousePressed(toggleNavigationMode);
}

function toggleNavigationMode() {
	navigationMode = !navigationMode;
	let clearButton = select("#clear-button");

	if (navigationMode) {
		clearButton.html("Disable Navigation Mode");
		clearButton.style("background-color", "#f44336");
	} else {
		clearButton.html("Enable Navigation Mode");
		clearButton.style("background-color", "#507c89");
	}
}

function draw() {
	image(video, 0, 0);
	hand = hands[0];
	if (hands.length > 0) {
		for (let hand of hands) {
			handType = hand.handedness;
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
			for (let [pt1, pt2] of connections) {
				let ptA = hand.keypoints[pt1];
				let ptB = hand.keypoints[pt2];
				stroke(0, 255, 0);
				strokeWeight(5 * palmLength * 0.01);
				line(ptA.x, ptA.y, ptB.x, ptB.y);
			}
			if (hand.confidence > 0.1) {
				for (let keypoint of hand.keypoints) {
					fill(255, 0, 0);
					circle(keypoint.x, keypoint.y, 20 * palmLength * 0.01);
				}
			}
			handDirection = determineHandDirection(9);
			let fingerState = determineFingerState(hand);
			textSize(20);
			stroke(0, 255, 0);
			strokeWeight(4);
			fill(255, 0, 0);
			let x_info = 30;
			if (handType == "Right") x_info = 420;
			if (fingerState == "10000") {
				text("Gesture : Pointing-" + `${handDirection}`, x_info, 30);
				if (navigationMode) {
					reDirectTo(handDirection);
				}
			} else if (fingerState == "11000") {
				text("Gesture : Two", x_info, 30);
			} else if (fingerState == "11100") {
				text("Gesture : Three", x_info, 30);
			} else if (fingerState == "11110") {
				text("Gesture : Four", x_info, 30);
			} else if (fingerState == "00000") {
				text("Gesture : Fist", x_info, 30);
			} else if (fingerState == "11111") {
				text("Gesture : Five", x_info, 30);
			} else if (fingerState == "00001") {
				handDirection = determineHandDirection(4);
				text("Gesture : Thumbs-" + `${handDirection}`, x_info, 30);
			} else {
				text("No Gesture Detected", x_info, 30);
			}
			text(`Direction : ${handDirection}`, x_info, 55);
			text(`HandType : ${handType}`, x_info, 80);
			text(
				`Dist from camera ${Math.round(1 / (palmLength * 0.00034))}cms`,
				x_info,
				105
			);
		}
	}
}
function reDirectTo(ref) {
	if (ref == "up") {
		window.open("../pose.html", "_self");
	} else if (ref == "left") {
		window.open("../drawing.html", "_self");
	} else if (ref == "right") {
		window.open("../music.html", "_self");
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
	handDirectionX = hand.keypoints[0].x - hand.keypoints[point].x;
	handDirectionY = hand.keypoints[0].y - hand.keypoints[point].y;

	if (Math.abs(handDirectionX) > Math.abs(handDirectionY)) {
		handDirection = handDirectionX > 0 ? "left" : "right";
	} else {
		handDirection = handDirectionY > 0 ? "up" : "down";
	}

	return handDirection;
}
