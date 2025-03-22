let video;
let bodyPose;
let poses = [];
let connections;
function preload() {
	bodyPose = ml5.bodyPose("MoveNet", { flipped: true });
	console.log("Model Loaded");
}
function mousePressed() {
	console.log(poses);
}
function setup() {
	createCanvas(640, 480);
	video = createCapture(VIDEO, { flipped: true });
	video.hide();
	bodyPose.detectStart(video, gotPoses);
	connections = bodyPose.getSkeleton();
}
function gotPoses(results) {
	poses = results;
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
}
