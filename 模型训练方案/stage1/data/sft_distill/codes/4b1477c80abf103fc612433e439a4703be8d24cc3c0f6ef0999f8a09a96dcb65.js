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
const SPEED = 80;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  
  // 生成纹理
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'redSquare');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * SPEED;
  const velocityY = Math.sin(angle) * SPEED;
  square.setVelocity(velocityX, velocityY);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  square.setBounce(1, 1);
}

function update(time, delta) {
  // 保持恒定速度（防止因碰撞导致速度衰减）
  const velocity = square.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed !== 0) {
    const scale = SPEED / currentSpeed;
    square.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);