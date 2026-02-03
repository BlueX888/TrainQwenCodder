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

let triangle;
let currentRotation = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象
  triangle = this.add.graphics();
  
  // 设置三角形样式
  triangle.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（以原点为中心）
  // 三角形顶点坐标：顶部、左下、右下
  triangle.fillTriangle(
    0, -50,    // 顶点
    -40, 40,   // 左下
    40, 40     // 右下
  );
  
  // 设置三角形位置到屏幕中心
  triangle.setPosition(400, 300);
  
  // 添加提示文字
  this.add.text(400, 550, '三角形以每秒 120° 的速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

function update(time, delta) {
  // 将 delta 从毫秒转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 每秒旋转 120 度，转换为弧度：120° = 120 * (Math.PI / 180) ≈ 2.094 弧度
  const rotationSpeed = Phaser.Math.DegToRad(120);
  
  // 累加旋转角度
  currentRotation += rotationSpeed * deltaInSeconds;
  
  // 应用旋转
  triangle.setRotation(currentRotation);
}

new Phaser.Game(config);