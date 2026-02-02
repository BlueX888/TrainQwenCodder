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
  // 绘制15个随机位置的橙色方块
  for (let i = 0; i < 15; i++) {
    // 生成随机位置，确保方块完全在画布内
    const x = Phaser.Math.Between(0, this.scale.width - 64);
    const y = Phaser.Math.Between(0, this.scale.height - 64);
    
    // 创建 Graphics 对象绘制橙色方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFA500, 1); // 橙色 (Orange)
    graphics.fillRect(x, y, 64, 64);
  }
}

new Phaser.Game(config);