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
  }
};

let square;
const SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('blueSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'blueSquare');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * SPEED;
  const velocityY = Math.sin(angle * Math.PI / 180) * SPEED;
  square.setVelocity(velocityX, velocityY);
  
  // 启用与世界边界的碰撞
  square.setCollideWorldBounds(true);
  
  // 启用边界反弹
  square.setBounce(1, 1);
}

function update(time, delta) {
  // 保持恒定速度（防止因碰撞导致速度衰减）
  const velocity = square.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - SPEED) > 1) {
    const scale = SPEED / currentSpeed;
    square.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);