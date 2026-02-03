const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let ellipse;

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象
  ellipse = this.add.graphics();
  
  // 设置椭圆样式和绘制
  ellipse.fillStyle(0x00ff00, 1);
  ellipse.fillEllipse(0, 0, 150, 80); // 中心点在(0,0)，宽150，高80
  
  // 设置椭圆位置到屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 添加提示文本
  const text = this.add.text(400, 50, '椭圆以每秒 240° 旋转', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

function update(time, delta) {
  // 计算每帧旋转的角度（弧度）
  // 240度/秒 = 240 * (Math.PI / 180) 弧度/秒
  // delta 是毫秒，需要转换为秒：delta / 1000
  const rotationSpeed = 240 * (Math.PI / 180); // 弧度/秒
  const rotationDelta = rotationSpeed * (delta / 1000);
  
  // 更新椭圆的旋转角度
  ellipse.rotation += rotationDelta;
}

new Phaser.Game(config);