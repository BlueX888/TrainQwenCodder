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
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1); // 蓝色
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  graphics.fillStar(32, 32, 5, 15, 30);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵，初始位置在画布中心
  this.star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置碰撞世界边界
  this.star.setCollideWorldBounds(true);
  
  // 获取方向键输入
  this.cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  this.star.setVelocity(0);
  
  const speed = 120;
  
  // 检测方向键并设置速度
  if (this.cursors.left.isDown) {
    this.star.setVelocityX(-speed);
  } else if (this.cursors.right.isDown) {
    this.star.setVelocityX(speed);
  }
  
  if (this.cursors.up.isDown) {
    this.star.setVelocityY(-speed);
  } else if (this.cursors.down.isDown) {
    this.star.setVelocityY(speed);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量
  if (this.star.body.velocity.x !== 0 && this.star.body.velocity.y !== 0) {
    // 对角线移动时速度会变快，需要归一化
    const normalized = this.star.body.velocity.normalize();
    this.star.setVelocity(normalized.x * speed, normalized.y * speed);
  }
}

new Phaser.Game(config);