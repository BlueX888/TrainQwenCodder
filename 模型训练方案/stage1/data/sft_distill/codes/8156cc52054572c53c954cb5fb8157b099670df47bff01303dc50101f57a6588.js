// 完整的 Phaser3 代码 - 在画布中央绘制红色矩形
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
  
  // 设置填充样式为红色，不透明度为 1
  graphics.fillStyle(0xff0000, 1);
  
  // 计算矩形的左上角位置，使其中心在画布中央
  // 画布中心：(400, 300)
  // 矩形大小：48x48
  // 左上角位置：(400 - 24, 300 - 24) = (376, 276)
  const rectSize = 48;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const rectX = centerX - rectSize / 2;
  const rectY = centerY - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

// 启动游戏
new Phaser.Game(config);