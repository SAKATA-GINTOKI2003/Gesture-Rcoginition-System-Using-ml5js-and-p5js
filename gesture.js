let video;
let hands = [];
let hand;
let handPose;
let connections;
let index_curl;
let midfinger_curl;
let ringfinger_curl;
let pinky_curl;
let thumb_curl;
let fingerState;
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
	console.log(fingerState);
	console.log(palmLength);
}

function setup() {
	let canvas = createCanvas(640, 480);
	canvas.parent("canvas-container");
	video = createCapture(VIDEO, { flipped: true });
	video.hide();
	handPose.detectStart(video, gotHands);
	connections = handPose.getConnections();
	// Select the clear button and attach navigation toggle functionality
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
		handType = hand.handedness;
		palmLength = dist(
			hand.keypoints[5].x,
			hand.keypoints[5].y,
			hand.keypoints[17].x,
			hand.keypoints[17].y
		);
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
		index_curl =
			dist(
				hand.keypoints[0].x,
				hand.keypoints[0].y,
				hand.keypoints[8].x,
				hand.keypoints[8].y
			) /
				palmLength <
			1.875;
		midfinger_curl =
			dist(
				hand.keypoints[0].x,
				hand.keypoints[0].y,
				hand.keypoints[12].x,
				hand.keypoints[12].y
			) /
				palmLength <
			2.125;
		ringfinger_curl =
			dist(
				hand.keypoints[0].x,
				hand.keypoints[0].y,
				hand.keypoints[16].x,
				hand.keypoints[16].y
			) /
				palmLength <
			1.875;
		pinky_curl =
			dist(
				hand.keypoints[0].x,
				hand.keypoints[0].y,
				hand.keypoints[20].x,
				hand.keypoints[20].y
			) /
				palmLength <
			1.75;
		thumb_curl =
			dist(
				hand.keypoints[0].x,
				hand.keypoints[0].y,
				hand.keypoints[4].x,
				hand.keypoints[4].y
			) /
				palmLength <
			1.5;

		fingerState = [
			index_curl,
			midfinger_curl,
			ringfinger_curl,
			pinky_curl,
			thumb_curl,
		]
			.map((val) => (val ? "0" : "1"))
			.join("");

		textSize(20);

		if (fingerState == "10000") {
			text("Gesture : Pointing-" + `${handDirection}`, 30, 30);
			if (navigationMode) {
				reDirectTo(handDirection);
			}
		} else if (fingerState == "11000") {
			text("Gesture : Two", 30, 30);
		} else if (fingerState == "11100") {
			text("Gesture : Three", 30, 30);
		} else if (fingerState == "11110") {
			text("Gesture : Four", 30, 30);
		} else if (fingerState == "00000") {
			text("Gesture : Fist", 30, 30);
		} else if (fingerState == "11111") {
			text("Gesture : Five", 30, 30);
		} else if (fingerState == "00001") {
			handDirection = determineHandDirection(4);
			text("Gesture : Thumbs-" + `${handDirection}`, 30, 30);
		} else {
			text("No Gesture Detected", 30, 30);
		}

		text(`Direction : ${handDirection}`, 30, 55);
		text(`HandType : ${handType}`, 30, 80);
		text(
			`Dist from camera ${Math.round(1 / (palmLength * 0.00034))}`,
			30,
			105
		);
	}
}

function reDirectTo(ref) {
	if (ref == "up") {
		window.location.href = "pose.html";
	} else if (ref == "left") {
		window.location.href = "drawing.html";
	}
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
