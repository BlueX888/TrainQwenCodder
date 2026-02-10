const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: { preload, create, update }
};

function preload() {
  // 创建黄色六边形纹理
  const graphics = this.add.graphics();
  
  // 设置黄色填充
  graphics.fillStyle(0xFFFF00, 1);
  
  // 计算六边形顶点（半径30）
  const radius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: radius + radius * Math.cos(angle),
      y: radius + radius * Math.sin(angle)
    });
  }
  
  // 绘制六边形
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  this.player = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置碰撞世界边界
  this.player.setCollideWorldBounds(true);
  
  // 创建方向键
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  this.player.setVelocity(0);
  
  // 检测方向键并设置速度
  if (this.cursors.left.isDown) {
    this.player.setVelocityX(-240);
  } else if (this.cursors.right.isDown) {
    this.player.setVelocityX(240);
  }
  
  if (this.cursors.up.isDown) {
    this.player.setVelocityY(-240);
  } else if (this.cursors.down.isDown) {
    this.player.setVelocityY(240);
  }
  
  // 处理对角线移动时的速度归一化
  if (this.cursors.left.isDown || this.cursors.right.isDown) {
    if (this.cursors.up.isDown || this.cursors.down.isDown) {
      // 对角线移动时，将速度调整为 240 * sqrt(2)/2 ≈ 170
      const velocity = this.player.body.velocity;
      velocity.normalize().scale(240);
    }
  }
}

new Phaser.Game(config);