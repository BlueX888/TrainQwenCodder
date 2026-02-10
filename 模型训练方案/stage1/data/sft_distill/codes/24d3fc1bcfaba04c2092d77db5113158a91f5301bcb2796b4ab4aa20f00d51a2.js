// 完整的 Phaser3 代码 - 绘制绿色椭圆
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
  // 本示例不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为绿色
  graphics.fillStyle(0x00ff00, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y 是椭圆中心点坐标
  // width 和 height 是椭圆的宽度和高度
  const centerX = config.width / 2;  // 400
  const centerY = config.height / 2; // 300
  const ellipseWidth = 48;
  const ellipseHeight = 48;
  
  graphics.fillEllipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

// 启动游戏
new Phaser.Game(config);