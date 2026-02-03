const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let diamond;
let currentRotation = 0;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制菱形
  diamond = this.add.graphics();
  
  // 设置填充颜色
  diamond.fillStyle(0x00ff00, 1);
  
  // 绘制菱形路径（中心点在原点）
  const path = new Phaser.Geom.Polygon([
    0, -60,    // 上顶点
    80, 0,     // 右顶点
    0, 60,     // 下顶点
    -80, 0     // 左顶点
  ]);
  
  diamond.fillPoints(path.points, true);
  
  // 设置菱形位置到屏幕中心
  diamond.x = 400;
  diamond.y = 300;
  
  // 初始化旋转角度
  currentRotation = 0;
}

function update(time, delta) {
  // 每秒旋转 160 度
  // delta 是毫秒，所以除以 1000 转换为秒
  const rotationSpeed = 160; // 度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  currentRotation += rotationIncrement;
  
  // 转换为弧度并应用到 Graphics 对象
  diamond.rotation = Phaser.Math.DegToRad(currentRotation);
}

new Phaser.Game(config);