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

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipse = this.add.graphics();
  
  // 设置填充样式（蓝色）
  ellipse.fillStyle(0x4488ff, 1);
  
  // 绘制椭圆（中心点在原点，宽度 200，高度 100）
  ellipse.fillEllipse(0, 0, 200, 100);
  
  // 将椭圆移动到画布中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 添加提示文本
  const text = this.add.text(400, 50, '椭圆每秒旋转 360 度', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // delta 是毫秒，转换为秒
  const deltaInSeconds = delta / 1000;
  
  // 每秒旋转 360 度 = 2π 弧度
  const rotationSpeed = Math.PI * 2; // 弧度/秒
  
  // 更新旋转角度
  ellipse.rotation += rotationSpeed * deltaInSeconds;
}

new Phaser.Game(config);