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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为绿色 (0x00ff00)，不透明度为 1
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算居中位置
  // 画布宽度 800，方块宽度 80，所以 x = (800 - 80) / 2 = 360
  // 画布高度 600，方块高度 80，所以 y = (600 - 80) / 2 = 260
  const squareSize = 80;
  const x = (config.width - squareSize) / 2;
  const y = (config.height - squareSize) / 2;
  
  // 绘制矩形：fillRect(x, y, width, height)
  graphics.fillRect(x, y, squareSize, squareSize);
}

// 启动游戏
new Phaser.Game(config);