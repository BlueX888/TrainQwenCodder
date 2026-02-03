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
  
  // 设置填充颜色为绿色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算中心位置
  // 画布尺寸: 800x600
  // 方块大小: 80x80
  // 中心点: (400, 300)
  // 方块左上角: (400 - 40, 300 - 40) = (360, 260)
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const squareSize = 80;
  
  // 绘制方块（左上角坐标，宽度，高度）
  graphics.fillRect(
    centerX - squareSize / 2,
    centerY - squareSize / 2,
    squareSize,
    squareSize
  );
}

// 启动游戏
new Phaser.Game(config);