// 完整的 Phaser3 代码 - 绘制黄色椭圆
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
  
  // 设置黄色填充样式
  graphics.fillStyle(0xffff00, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 为椭圆中心点坐标
  // width 为椭圆的宽度（直径），height 为椭圆的高度（直径）
  const centerX = this.cameras.main.width / 2;  // 400
  const centerY = this.cameras.main.height / 2; // 300
  const ellipseWidth = 48;
  const ellipseHeight = 48;
  
  graphics.fillEllipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

// 启动游戏
new Phaser.Game(config);