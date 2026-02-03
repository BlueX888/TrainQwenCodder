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

let rectangle;
const SPEED = 240;

function preload() {
  // 使用 Graphics 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 30);
  graphics.generateTexture('yellowRect', 50, 30);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  rectangle = this.physics.add.sprite(400, 300, 'yellowRect');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * SPEED;
  const velocityY = Math.sin(angle * Math.PI / 180) * SPEED;
  rectangle.setVelocity(velocityX, velocityY);
  
  // 启用与世界边界的碰撞
  rectangle.setCollideWorldBounds(true);
  
  // 启用边界反弹
  rectangle.setBounce(1, 1);
  
  // 设置世界边界
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // 保持恒定速度（防止速度衰减）
  const velocity = rectangle.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed > 0) {
    const scale = SPEED / currentSpeed;
    rectangle.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);