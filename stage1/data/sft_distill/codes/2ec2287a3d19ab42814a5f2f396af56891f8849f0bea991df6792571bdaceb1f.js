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
  
  // 设置绿色填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算中央位置
  // 矩形大小为 80x80，中心点在画布中央 (400, 300)
  // 所以矩形左上角应该在 (400 - 40, 300 - 40) = (360, 260)
  const rectSize = 80;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const rectX = centerX - rectSize / 2;
  const rectY = centerY - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

new Phaser.Game(config);