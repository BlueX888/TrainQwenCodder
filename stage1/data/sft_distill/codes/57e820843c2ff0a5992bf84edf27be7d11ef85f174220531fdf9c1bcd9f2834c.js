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
  
  // 计算矩形左上角坐标，使其在画布中央
  // 画布宽度: 800, 高度: 600
  // 矩形大小: 80x80
  const rectSize = 80;
  const x = (config.width - rectSize) / 2;  // (800 - 80) / 2 = 360
  const y = (config.height - rectSize) / 2; // (600 - 80) / 2 = 260
  
  // 在中央绘制绿色矩形
  graphics.fillRect(x, y, rectSize, rectSize);
}

// 启动游戏
new Phaser.Game(config);