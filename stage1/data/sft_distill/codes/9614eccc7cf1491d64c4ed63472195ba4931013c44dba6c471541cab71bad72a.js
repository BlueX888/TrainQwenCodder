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
const rotationSpeed = 200; // 每秒旋转 200 度

function preload() {
  // 本任务无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipse = this.add.graphics();
  
  // 设置填充样式为蓝色
  ellipse.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心点在原点，宽 200，高 100）
  ellipse.fillEllipse(0, 0, 200, 100);
  
  // 将椭圆定位到画布中心
  ellipse.x = config.width / 2;
  ellipse.y = config.height / 2;
  
  // 添加一个小标记点，用于观察旋转效果
  ellipse.fillStyle(0xff0000, 1);
  ellipse.fillCircle(100, 0, 8);
}

function update(time, delta) {
  // 将旋转速度从度转换为弧度
  const rotationRadians = Phaser.Math.DegToRad(rotationSpeed);
  
  // 根据 delta 时间（毫秒）计算本帧应旋转的角度
  // delta 是毫秒，需要转换为秒：delta / 1000
  ellipse.rotation += rotationRadians * (delta / 1000);
  
  // 可选：限制旋转角度在 0 到 2π 之间，避免数值过大
  if (ellipse.rotation > Math.PI * 2) {
    ellipse.rotation -= Math.PI * 2;
  }
}

// 创建游戏实例
new Phaser.Game(config);