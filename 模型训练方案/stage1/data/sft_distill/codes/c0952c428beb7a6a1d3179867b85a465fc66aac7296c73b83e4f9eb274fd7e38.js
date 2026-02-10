const config = {
  type: Phaser.HEADLESS,
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

let ball;
const SPEED = 360;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillCircle(25, 25, 25); // 半径 25 的圆形
  
  // 生成纹理
  graphics.generateTexture('ballTexture', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵
  ball = this.physics.add.sprite(400, 300, 'ballTexture');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const vx = Math.cos(Phaser.Math.DegToRad(angle)) * SPEED;
  const vy = Math.sin(Phaser.Math.DegToRad(angle)) * SPEED;
  ball.setVelocity(vx, vy);
  
  // 设置与世界边界碰撞
  ball.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ball.setBounce(1, 1);
}

function update(time, delta) {
  // 确保速度保持恒定（归一化速度向量并乘以固定速度）
  const velocity = ball.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed > 0) {
    const normalizedX = velocity.x / currentSpeed;
    const normalizedY = velocity.y / currentSpeed;
    ball.setVelocity(normalizedX * SPEED, normalizedY * SPEED);
  }
}

new Phaser.Game(config);