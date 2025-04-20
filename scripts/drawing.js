let video;
let hand;
let hands = [];
let handPose;
let painting;
let prevX = 0,
	prevY = 0;
let navigationMode = false;
let handDirection;
let palmLength;
function preload() {
	handPose = ml5.handPose({ flipped: true });
}

function gotHands(results) {
	hands = results;
}

function mousePressed() {
	console.log(hands);
}

function setup() {
	let canvas = createCanvas(640, 480);
	canvas.parent("canvas-container");

	painting = createGraphics(640, 480);
	painting.background(255);
	painting.clear();

	video = createCapture(VIDEO, { flipped: true });
	video.hide();
	handPose.detectStart(video, gotHands);
	let navigationButton = select("#navigation-button");
	navigationButton.mousePressed(toggleNavigationMode);
}

function draw() {
	image(video, 0, 0);
	hand = hands[0];
	if (hands.length > 0) {
		let index_finger = hand.index_finger_tip;
		let thumb = hand.thumb_tip;
		painting.noStroke();
		let x = (index_finger.x + thumb.x) * 0.5;
		let y = (index_finger.y + thumb.y) * 0.5;
		let d = dist(thumb.x, thumb.y, index_finger.x, index_finger.y);
		if (d < 25) {
			painting.stroke(0, 0, 0);
			painting.strokeWeight(8);
			painting.line(prevX, prevY, x, y);
		} else {
			fill(255, 0, 0);
			circle(index_finger.x, index_finger.y, 16);
			circle(thumb.x, thumb.y, 16);
		}
		prevX = x;
		prevY = y;
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
			if (navigationMode) {
				reDirectTo(handDirection);
			}
		}
	}
	image(painting, 0, 0);
}
function clearCanvas() {
	painting.clear();
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
		window.open("../pose.html", "_self");
	} else if (ref == "right") {
		window.open("../music.html", "_self");
	}
}
