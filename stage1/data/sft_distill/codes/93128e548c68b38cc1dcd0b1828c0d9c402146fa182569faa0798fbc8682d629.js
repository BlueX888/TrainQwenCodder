const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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
  
  // 设置填充样式为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆中心点坐标
  // width 和 height 是椭圆的宽度和高度
  const centerX = config.width / 2;  // 400
  const centerY = config.height / 2; // 300
  const ellipseWidth = 24;
  const ellipseHeight = 24;
  
  graphics.fillEllipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

new Phaser.Game(config);