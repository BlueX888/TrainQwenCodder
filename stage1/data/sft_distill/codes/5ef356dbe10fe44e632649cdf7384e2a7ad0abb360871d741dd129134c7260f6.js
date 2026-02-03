const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 无重力
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  // 使用 Graphics 创建灰色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1);  // 灰色
  graphics.fillCircle(25, 25, 25);  // 半径25的圆形
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  this.ball = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置物理属性
  this.ball.setCollideWorldBounds(true);  // 与世界边界碰撞
  this.ball.setBounce(1, 1);  // 完全弹性碰撞，反弹系数为1
  
  // 设置初始速度为 360（可以是任意方向，这里设置为斜向）
  // 使用勾股定理计算：速度大小为360，方向为45度
  const speed = 360;
  const angle = Math.PI / 4;  // 45度
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;
  
  this.ball.setVelocity(vx, vy);
  
  // 确保速度保持恒定（可选：防止浮点误差累积）
  this.targetSpeed = speed;
}

function update(time, delta) {
  // 可选：修正速度大小，确保始终保持360的速度
  // 这可以防止由于浮点运算误差导致的速度变化
  const body = this.ball.body;
  const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
  
  if (Math.abs(currentSpeed - this.targetSpeed) > 0.1) {
    const ratio = this.targetSpeed / currentSpeed;
    body.velocity.x *= ratio;
    body.velocity.y *= ratio;
  }
}

new Phaser.Game(config);