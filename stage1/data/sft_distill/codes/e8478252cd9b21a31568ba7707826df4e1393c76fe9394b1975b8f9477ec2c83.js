const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制五角星 (中心点在 50, 50，外半径 50，内半径 25)
  graphics.fillStar(50, 50, 5, 25, 50);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建带物理属性的星形精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置速度为 240（使用勾股定理分解为 x 和 y 方向）
  // 速度 240，以 45 度角移动：x = y = 240 / sqrt(2) ≈ 169.7
  const velocity = 240 / Math.sqrt(2);
  star.setVelocity(velocity, velocity);
  
  // 设置与世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 添加调试信息文本
  const debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff'
  });
  
  // 更新调试信息
  this.events.on('update', () => {
    debugText.setText([
      `Position: (${Math.round(star.x)}, ${Math.round(star.y)})`,
      `Velocity: (${Math.round(star.body.velocity.x)}, ${Math.round(star.body.velocity.y)})`,
      `Speed: ${Math.round(star.body.speed)}`
    ]);
  });
}

new Phaser.Game(config);