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
  // 不需要预加载任何资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置绿色填充样式 (RGB: 0, 255, 0)
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算矩形左上角位置，使其在画布中央
  // 画布中心: (400, 300)
  // 矩形大小: 24x24
  // 左上角位置: (400 - 12, 300 - 12) = (388, 288)
  const rectSize = 24;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const rectX = centerX - rectSize / 2;
  const rectY = centerY - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

// 启动游戏
new Phaser.Game(config);