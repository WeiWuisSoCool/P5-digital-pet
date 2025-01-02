let deathStar;
let handpose;
let predictions = [];
let video;
let rotationX = 0;
let rotationY = 0;

function setup() {
  createCanvas(640, 480, WEBGL);

  video = createCapture(VIDEO);
  video.size(400, 400);
  video.hide();

  // 初始化CSG对象
  deathStar = csg(() => sphere(50))
    .subtract(() => {
      translate(40, -40);
      sphere(25);
    })
    .union(() => sphere(40))
    .done();

  // 初始化手部识别模型
  handpose = ml5.handpose(video, () => {
    console.log("Handpose model loaded");
  });

  // 获取预测数据
  handpose.on("predict", (results) => {
    predictions = results;
    if (predictions.length > 0) {
      // 获取手腕和中指基部的关键点
      const wrist = predictions[0].landmarks[0];
      const middleFinger = predictions[0].landmarks[9];

      // 计算手掌的旋转角度
      const dx = middleFinger[0] - wrist[0];
      const dy = middleFinger[1] - wrist[1];
      rotationX = map(dy, -200, 200, -PI, PI);
      rotationY = map(dx, -200, 200, -PI, PI);
    }
  });
}

function draw() {
  // 在背景中绘制摄像头画面，覆盖整个画布
  push();
  translate(0, 0, -500); // 将视频背景放置到3D场景后方
  rotateY(PI); // 翻转视频以实现镜像效果
  texture(video);
  plane(width, height); // 将视频作为平面，覆盖整个画布
  pop();

  // 渲染3D球体
  clearDepth(); // 确保3D对象在视频前方显示
  orbitControl();
  noStroke();
  lights();

  push();
  // 根据手部旋转调整球体的旋转
  rotateX(rotationX);
  rotateY(rotationY);
  model(deathStar);
  pop();
}
