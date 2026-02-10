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
  // 使用 Graphics 生成橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('orangeBox', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const box = this.physics.add.sprite(400, 300, 'orangeBox');
  
  // 设置初始速度（120 像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 120);
  box.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  box.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  box.setBounce(1, 1);
  
  // 确保世界边界启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);