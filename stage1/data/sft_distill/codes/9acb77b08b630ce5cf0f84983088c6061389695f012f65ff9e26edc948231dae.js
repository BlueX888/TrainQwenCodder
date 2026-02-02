const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置灰色填充样式
  graphics.fillStyle(0x808080, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // 中心点在 (400, 300)，宽度和高度都设为 48 像素
  graphics.fillEllipse(400, 300, 48, 48);
}

new Phaser.Game(config);