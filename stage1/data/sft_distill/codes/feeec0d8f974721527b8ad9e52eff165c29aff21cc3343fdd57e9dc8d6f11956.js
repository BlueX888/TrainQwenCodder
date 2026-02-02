const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置绿色填充样式
  graphics.fillStyle(0x00ff00, 1);
  
  // 计算画布中心位置
  const centerX = this.cameras.main.width / 2;
  const centerY = this.cameras.main.height / 2;
  
  // 绘制 80x80 的矩形，矩形左上角位置为 (centerX - 40, centerY - 40)
  // 这样矩形中心就在画布中心
  graphics.fillRect(centerX - 40, centerY - 40, 80, 80);
}

new Phaser.Game(config);