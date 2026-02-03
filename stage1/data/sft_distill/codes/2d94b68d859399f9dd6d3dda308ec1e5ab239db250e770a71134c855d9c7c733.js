const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  scene: { preload, create }
};

function preload() {
  // 无需预加载资源
}

function create() {
  // 创建 Graphics 对象用于绘制形状
  const graphics = this.add.graphics();
  
  // 设置填充颜色为灰色 (0x808080)
  graphics.fillStyle(0x808080, 1);
  
  // 绘制10个随机位置的方块
  for (let i = 0; i < 10; i++) {
    // 生成随机位置，确保方块完全在画布内
    // x: 0 到 (800 - 24)，y: 0 到 (600 - 24)
    const x = Phaser.Math.Between(0, 776);
    const y = Phaser.Math.Between(0, 576);
    
    // 绘制 24x24 的方块
    graphics.fillRect(x, y, 24, 24);
  }
}

new Phaser.Game(config);