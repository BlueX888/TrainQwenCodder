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
  // 使用 Graphics 创建紫色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1); // 紫色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('purpleBox', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  this.box = this.physics.add.sprite(400, 300, 'purpleBox');
  
  // 设置初始速度（速度120，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 120);
  this.box.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  this.box.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  this.box.setBounce(1, 1);
  
  // 添加提示文本
  this.add.text(10, 10, 'Purple box bouncing at speed 120', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 保持速度恒定为 120
  const currentVelocity = this.box.body.velocity;
  const currentSpeed = Math.sqrt(currentVelocity.x ** 2 + currentVelocity.y ** 2);
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - 120) > 0.1) {
    const scale = 120 / currentSpeed;
    this.box.setVelocity(currentVelocity.x * scale, currentVelocity.y * scale);
  }
}

new Phaser.Game(config);