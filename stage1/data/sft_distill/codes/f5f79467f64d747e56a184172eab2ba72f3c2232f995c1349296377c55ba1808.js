// 完整的 Phaser3 代码 - 在画布中央绘制粉色椭圆
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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置粉色填充样式
  // 0xFFC0CB 是标准的粉色十六进制颜色值
  graphics.fillStyle(0xFFC0CB, 1);
  
  // 在画布中央绘制椭圆
  // fillEllipse(x, y, width, height)
  // x, y: 椭圆中心坐标
  // width: 椭圆宽度（直径）
  // height: 椭圆高度（直径）
  const centerX = config.width / 2;  // 400
  const centerY = config.height / 2; // 300
  const ellipseWidth = 24;
  const ellipseHeight = 24;
  
  graphics.fillEllipse(centerX, centerY, ellipseWidth, ellipseHeight);
}

// 启动游戏
new Phaser.Game(config);