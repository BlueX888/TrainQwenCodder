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
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 计算矩形左上角坐标，使其在画布中央
  // 画布中心: (400, 300)
  // 矩形大小: 64x64
  // 左上角坐标: (400 - 32, 300 - 32) = (368, 268)
  const rectX = config.width / 2 - 32;
  const rectY = config.height / 2 - 32;
  const rectSize = 64;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectSize, rectSize);
}

// 启动游戏
new Phaser.Game(config);