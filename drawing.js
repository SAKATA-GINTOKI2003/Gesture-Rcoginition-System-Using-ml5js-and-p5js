let video;
let hands = [];
let handPose;
let painting;
let prevX = 0,
	prevY = 0;

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
	canvas.parent('canvas-container'); 

	painting = createGraphics(640, 480);
	painting.background(255);
	painting.clear();

	video = createCapture(VIDEO, { flipped: true });
	video.hide();
	handPose.detectStart(video, gotHands);
}

function draw() {
	image(video, 0, 0);
	if (hands.length > 0) {
		let hand = hands[0];
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
	}
	image(painting, 0, 0);
}
function clearCanvas() {
    painting.clear();
}
