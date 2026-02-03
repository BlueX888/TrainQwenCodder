const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 不需要重力
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

let ball;
const BALL_SPEED = 300;

function preload() {
  // 使用 Graphics 创建蓝色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);  // 蓝色
  graphics.fillCircle(20, 20, 20);  // 半径20的圆形
  graphics.generateTexture('blueBall', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  ball = this.physics.add.sprite(400, 300, 'blueBall');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * BALL_SPEED;
  const velocityY = Math.sin(angle * Math.PI / 180) * BALL_SPEED;
  ball.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  ball.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ball.setBounce(1, 1);
  
  // 确保世界边界碰撞已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // 保持速度恒定（避免因浮点误差导致速度衰减）
  const currentSpeed = Math.sqrt(
    ball.body.velocity.x * ball.body.velocity.x + 
    ball.body.velocity.y * ball.body.velocity.y
  );
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - BALL_SPEED) > 1) {
    const scale = BALL_SPEED / currentSpeed;
    ball.setVelocity(
      ball.body.velocity.x * scale,
      ball.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);