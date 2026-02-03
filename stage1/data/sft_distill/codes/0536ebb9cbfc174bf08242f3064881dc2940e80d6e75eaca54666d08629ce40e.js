// 完整的 Phaser3 代码 - 在画布中央绘制红色矩形
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
  // 本示例不需要预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充样式为红色，不透明度为 1
  graphics.fillStyle(0xff0000, 1);
  
  // 计算矩形左上角坐标，使其在画布中央
  // 画布宽度 800，矩形宽度 64，所以 x = (800 - 64) / 2 = 368
  // 画布高度 600，矩形高度 64，所以 y = (600 - 64) / 2 = 268
  const rectX = (config.width - 64) / 2;
  const rectY = (config.height - 64) / 2;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, 64, 64);
}

// 启动游戏
new Phaser.Game(config);