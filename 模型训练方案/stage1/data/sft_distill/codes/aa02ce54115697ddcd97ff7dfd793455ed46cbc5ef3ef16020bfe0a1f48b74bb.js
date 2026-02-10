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
  // 本示例不需要预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为红色，透明度为 1（完全不透明）
  graphics.fillStyle(0xff0000, 1);
  
  // 计算矩形左上角位置，使其中心位于画布中央
  // 画布中心: (400, 300)
  // 矩形大小: 48x48
  // 左上角位置: (400 - 24, 300 - 24) = (376, 276)
  const rectSize = 48;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const rectX = centerX - rectSize / 2;
  const rectY = centerY - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

// 创建并启动游戏
new Phaser.Game(config);