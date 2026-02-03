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
  
  // 计算矩形左上角位置（画布中央 - 矩形尺寸的一半）
  const rectSize = 64;
  const x = (config.width - rectSize) / 2;  // 400 - 32 = 368
  const y = (config.height - rectSize) / 2; // 300 - 32 = 268
  
  // 绘制矩形
  graphics.fillRect(x, y, rectSize, rectSize);
}

// 创建游戏实例
new Phaser.Game(config);