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

let rectangle;
// 每秒旋转 120 度，转换为弧度/毫秒
const rotationSpeed = Phaser.Math.DegToRad(120); // 弧度/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象
  rectangle = this.add.graphics();
  
  // 设置填充颜色为红色
  rectangle.fillStyle(0xff0000, 1);
  
  // 绘制矩形（相对于原点居中，便于旋转）
  // 矩形中心在 (0, 0)，宽 100，高 60
  rectangle.fillRect(-50, -30, 100, 60);
  
  // 设置矩形位置到屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 添加提示文字
  this.add.text(10, 10, '矩形以每秒 120° 速度旋转', {
    fontSize: '20px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // delta 是自上一帧以来的毫秒数
  // 将 delta 转换为秒，然后乘以旋转速度（弧度/秒）
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  rectangle.rotation += rotationDelta;
}

new Phaser.Game(config);