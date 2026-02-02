const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create
  },
  backgroundColor: '#ffffff'
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制
  const graphics = this.add.graphics();
  
  // 设置填充颜色为灰色
  graphics.fillStyle(0x808080, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆中心点坐标
  // width 是椭圆的宽度，height 是椭圆的高度
  const centerX = 400;
  const centerY = 300;
  const ellipseWidth = 48;
  const ellipseHeight = 48;
  
  graphics.fillEllipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

new Phaser.Game(config);