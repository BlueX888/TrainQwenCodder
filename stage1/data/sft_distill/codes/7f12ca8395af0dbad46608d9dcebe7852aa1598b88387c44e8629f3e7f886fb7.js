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
  
  // 设置填充样式为绿色
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算矩形左上角位置，使其居中
  // 画布中心：(400, 300)
  // 矩形大小：80x80
  // 左上角坐标：(400 - 40, 300 - 40) = (360, 260)
  const rectSize = 80;
  const x = config.width / 2 - rectSize / 2;
  const y = config.height / 2 - rectSize / 2;
  
  // 绘制矩形
  graphics.fillRect(x, y, rectSize, rectSize);
}

// 启动游戏
new Phaser.Game(config);