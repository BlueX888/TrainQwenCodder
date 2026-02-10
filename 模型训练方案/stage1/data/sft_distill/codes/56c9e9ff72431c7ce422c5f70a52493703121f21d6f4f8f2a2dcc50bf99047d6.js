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
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制矩形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为青色（Cyan）
  graphics.fillStyle(0x00ffff, 1);
  
  // 计算矩形左上角位置（画布中央 - 矩形尺寸的一半）
  const rectSize = 24;
  const x = config.width / 2 - rectSize / 2;  // 400 - 12 = 388
  const y = config.height / 2 - rectSize / 2; // 300 - 12 = 288
  
  // 在画布中央绘制 24x24 的青色矩形
  graphics.fillRect(x, y, rectSize, rectSize);
}

new Phaser.Game(config);