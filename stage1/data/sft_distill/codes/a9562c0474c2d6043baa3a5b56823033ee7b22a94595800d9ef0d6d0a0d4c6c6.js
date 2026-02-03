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
    create: create,
    update: update
  }
};

let ball;
const SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(20, 20, 20); // 圆心在(20,20)，半径20
  graphics.generateTexture('ballTexture', 40, 40);
  graphics.destroy();

  // 创建物理精灵
  ball = this.physics.add.sprite(400, 300, 'ballTexture');
  
  // 设置随机初始速度方向，但保持速度大小为300
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const vx = Math.cos(angle) * SPEED;
  const vy = Math.sin(angle) * SPEED;
  ball.setVelocity(vx, vy);
  
  // 设置碰撞边界
  ball.setCollideWorldBounds(true);
  ball.setBounce(1, 1); // 完全弹性碰撞
  
  // 启用世界边界
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // 保持速度恒定为300
  const velocity = ball.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed !== 0) {
    const scale = SPEED / currentSpeed;
    ball.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);