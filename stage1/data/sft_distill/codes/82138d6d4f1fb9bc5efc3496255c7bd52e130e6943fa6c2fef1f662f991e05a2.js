const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置填充样式为红色
  graphics.fillStyle(0xff0000, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆中心坐标
  // width 和 height 是椭圆的宽度和高度（直径）
  const centerX = this.cameras.main.width / 2;  // 400
  const centerY = this.cameras.main.height / 2; // 300
  const ellipseWidth = 16;
  const ellipseHeight = 16;
  
  graphics.fillEllipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

new Phaser.Game(config);