const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let ellipse;
let currentRotation = 0; // 当前旋转角度（弧度）

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipse = this.add.graphics();
  
  // 设置椭圆的位置（中心点）
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 绘制椭圆
  ellipse.fillStyle(0x00ff00, 1); // 绿色填充
  ellipse.fillEllipse(0, 0, 150, 80); // 在本地坐标 (0, 0) 绘制椭圆，宽150，高80
  
  // 添加边框以便更清楚地看到旋转效果
  ellipse.lineStyle(3, 0xffffff, 1);
  ellipse.strokeEllipse(0, 0, 150, 80);
  
  // 在椭圆上添加一个标记点，方便观察旋转
  ellipse.fillStyle(0xff0000, 1);
  ellipse.fillCircle(75, 0, 8); // 红色圆点作为标记
}

function update(time, delta) {
  // 每秒旋转 200 度
  const degreesPerSecond = 200;
  
  // delta 是毫秒，转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 计算本帧应旋转的角度（度）
  const rotationDegrees = degreesPerSecond * deltaInSeconds;
  
  // 转换为弧度并累加到当前旋转角度
  currentRotation += Phaser.Math.DegToRad(rotationDegrees);
  
  // 应用旋转
  ellipse.rotation = currentRotation;
}

new Phaser.Game(config);