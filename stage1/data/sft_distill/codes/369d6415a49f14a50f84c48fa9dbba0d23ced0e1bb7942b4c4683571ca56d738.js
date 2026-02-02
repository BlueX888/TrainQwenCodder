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

let square;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色方块并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('squareTex', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'squareTex');
  
  // 设置初始速度（随机方向，速度为360）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 360;
  const velocityY = Math.sin(angle) * 360;
  square.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

function update(time, delta) {
  // 保持速度恒定为 360
  const currentVelocity = square.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度不为0，归一化并乘以目标速度360
  if (currentSpeed > 0) {
    const normalizedX = currentVelocity.x / currentSpeed;
    const normalizedY = currentVelocity.y / currentSpeed;
    square.setVelocity(normalizedX * 360, normalizedY * 360);
  }
}

new Phaser.Game(config);