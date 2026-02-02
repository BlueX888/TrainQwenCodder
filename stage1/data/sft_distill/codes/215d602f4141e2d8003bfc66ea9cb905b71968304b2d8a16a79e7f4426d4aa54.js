// 完整的 Phaser3 代码 - 绘制粉色椭圆
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
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充样式为粉色
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆中心点坐标
  // width 和 height 是椭圆的宽度和高度
  const centerX = this.cameras.main.width / 2;  // 400
  const centerY = this.cameras.main.height / 2; // 300
  const ellipseWidth = 24;
  const ellipseHeight = 24;
  
  graphics.fillEllipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

// 启动游戏
new Phaser.Game(config);