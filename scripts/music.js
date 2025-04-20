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
let synth;
let notes = [
	"C4",
	"D4",
	"E4",
	"G4",
	"A4",
	"B4",
	"C5",
	"A4",
	"F4",
	"G4",
	"D#4",
	"C4",
];
let numToFing = new Map([
	["00000", 0],
	["10000", 1],
	["11000", 2],
	["11100", 3],
	["11110", 4],
	["11111", 5],
	["00001", 6],
]);

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
	synth = new Tone.Synth().toDestination();
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
	let i = 0;
	if (hands.length <= 2 && hands.length > 0) {
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
			hands[i].fingCount = numToFing.get(fingerState);
			i++;
		}
		let hand2Count;
		if (!hands[1]) {
			hand2Count = 0;
		} else {
			hand2Count = hands[1].fingCount;
		}
		let fingCount = hands[0].fingCount + hand2Count;
		synth.triggerAttackRelease(notes[fingCount], "8n");
		textSize(20);
		stroke(0, 255, 0);
		text(`Current Note Playing : ${notes[fingCount]}`, 30, 80);
		handDirection = determineHandDirection(9);
		let fingerState = determineFingerState(hand);

		strokeWeight(4);
		fill(255, 0, 0);
		if (navigationMode) {
			if (fingerState == "10000") {
				text("Gesture : Pointing-" + `${handDirection}`, 30, 30);
				reDirectTo(handDirection);
			}
		}
	}
}
function reDirectTo(ref) {
	if (ref == "up") {
		window.open("../gesture.html", "_self");
	} else if (ref == "left") {
		window.open("../drawing.html", "_self");
	} else if (ref == "right") {
		window.open("../pose.html", "_self");
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
