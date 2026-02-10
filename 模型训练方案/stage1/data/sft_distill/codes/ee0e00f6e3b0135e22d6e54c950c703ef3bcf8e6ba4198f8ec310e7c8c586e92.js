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

let ellipse;
const SPEED = 120;

function preload() {
  // 创建紫色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点(40,30)，宽80，高60
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, SPEED);
  ellipse.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 确保世界边界碰撞开启
  this.physics.world.setBoundsCollision(true, true, true, true);
}

function update(time, delta) {
  // 保持速度恒定为120
  const currentSpeed = Math.sqrt(
    ellipse.body.velocity.x * ellipse.body.velocity.x + 
    ellipse.body.velocity.y * ellipse.body.velocity.y
  );
  
  if (currentSpeed !== 0) {
    const scale = SPEED / currentSpeed;
    ellipse.setVelocity(
      ellipse.body.velocity.x * scale,
      ellipse.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);