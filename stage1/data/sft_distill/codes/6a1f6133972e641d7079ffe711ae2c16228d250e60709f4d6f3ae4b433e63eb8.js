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
  
  // 设置填充颜色为绿色 (0x00ff00)，透明度为 1
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算矩形左上角坐标，使其在画布中央
  // 画布中心点: (400, 300)
  // 矩形大小: 24x24
  // 左上角坐标: (400 - 12, 300 - 12) = (388, 288)
  const rectSize = 24;
  const centerX = config.width / 2;
  const centerY = config.height / 2;
  const x = centerX - rectSize / 2;
  const y = centerY - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(x, y, rectSize, rectSize);
}

// 启动游戏
new Phaser.Game(config);