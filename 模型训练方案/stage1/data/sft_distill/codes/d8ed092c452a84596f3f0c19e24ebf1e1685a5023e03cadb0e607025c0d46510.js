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
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充样式为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 计算矩形左上角位置，使其中心位于画布中央
  // 画布中心：(400, 300)
  // 矩形尺寸：64x64
  // 左上角位置：(400 - 32, 300 - 32) = (368, 268)
  const rectSize = 64;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const rectX = centerX - rectSize / 2;
  const rectY = centerY - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

// 创建游戏实例
new Phaser.Game(config);