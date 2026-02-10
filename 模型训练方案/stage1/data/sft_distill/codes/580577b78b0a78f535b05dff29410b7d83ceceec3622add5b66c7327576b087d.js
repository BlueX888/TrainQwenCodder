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
  
  // 设置填充样式为红色，透明度为 1
  graphics.fillStyle(0xff0000, 1);
  
  // 计算矩形左上角坐标，使其居中
  // 画布中心点: (400, 300)
  // 矩形大小: 64x64
  // 左上角坐标: (400 - 32, 300 - 32) = (368, 268)
  const rectX = 368;
  const rectY = 268;
  const rectWidth = 64;
  const rectHeight = 64;
  
  // 绘制矩形
  graphics.fillRect(rectX, rectY, rectWidth, rectHeight);
}

// 启动游戏
new Phaser.Game(config);