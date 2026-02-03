const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力，保持匀速运动
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
const SPEED = 120;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建紫色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1);  // 紫色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('purpleSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'purpleSquare');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * SPEED;
  const velocityY = Math.sin(angle * Math.PI / 180) * SPEED;
  square.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完美弹性碰撞
  square.setBounce(1, 1);
}

function update(time, delta) {
  // 保持速度恒定为120
  // 由于反弹可能导致速度变化，需要归一化速度向量
  const currentVelocity = square.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  if (currentSpeed !== 0 && Math.abs(currentSpeed - SPEED) > 0.1) {
    // 归一化并重新设置为目标速度
    square.setVelocity(
      (currentVelocity.x / currentSpeed) * SPEED,
      (currentVelocity.y / currentSpeed) * SPEED
    );
  }
}

new Phaser.Game(config);