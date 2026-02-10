const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充样式为绿色 (0x00ff00)，不透明度为 1
  graphics.fillStyle(0x00ff00, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆的中心点坐标
  // width 和 height 是椭圆的宽度和高度
  graphics.fillEllipse(400, 300, 48, 48);
}

new Phaser.Game(config);