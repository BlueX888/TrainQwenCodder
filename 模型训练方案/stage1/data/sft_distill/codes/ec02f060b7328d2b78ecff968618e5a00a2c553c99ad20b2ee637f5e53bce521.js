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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  rectangle = this.add.graphics();
  
  // 设置填充颜色
  rectangle.fillStyle(0x00ff00, 1);
  
  // 绘制矩形（以 0,0 为中心，宽 100，高 60）
  rectangle.fillRect(-50, -30, 100, 60);
  
  // 设置矩形位置到屏幕中心
  rectangle.x = 400;
  rectangle.y = 300;
  
  // 添加提示文本
  this.add.text(10, 10, '矩形以每秒 120 度的速度旋转', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 每秒 120 度 = 120 * (Math.PI / 180) 弧度/秒
  // delta 是毫秒，需要转换为秒
  const rotationSpeed = (120 * Math.PI / 180); // 约 2.094 弧度/秒
  const rotationIncrement = rotationSpeed * (delta / 1000);
  
  // 累加旋转角度
  rectangle.rotation += rotationIncrement;
}

new Phaser.Game(config);