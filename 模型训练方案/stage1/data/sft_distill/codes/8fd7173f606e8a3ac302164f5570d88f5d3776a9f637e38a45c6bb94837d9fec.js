// 完整的 Phaser3 代码 - 绘制绿色方块
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
  
  // 设置填充颜色为绿色 (0x00ff00)，透明度为 1
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算中心位置
  // 画布宽度 800，方块宽度 80，中心 x = (800 - 80) / 2 = 360
  // 画布高度 600，方块高度 80，中心 y = (600 - 80) / 2 = 260
  const squareSize = 80;
  const centerX = (config.width - squareSize) / 2;
  const centerY = (config.height - squareSize) / 2;
  
  // 在中心位置绘制方块
  graphics.fillRect(centerX, centerY, squareSize, squareSize);
}

// 创建并启动游戏
new Phaser.Game(config);