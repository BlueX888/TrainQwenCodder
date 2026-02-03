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
    create: create
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色矩形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFC0CB, 1); // 粉色 (Pink)
  graphics.fillRect(0, 0, 60, 40);
  
  // 生成纹理
  graphics.generateTexture('pinkRect', 60, 40);
  graphics.destroy();
  
  // 创建物理精灵
  const rectangle = this.physics.add.sprite(400, 300, 'pinkRect');
  
  // 设置初始速度（随机方向，速度为 80）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 80);
  rectangle.setVelocity(velocity.x, velocity.y);
  
  // 设置世界边界碰撞
  rectangle.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  rectangle.setBounce(1, 1);
}

new Phaser.Game(config);