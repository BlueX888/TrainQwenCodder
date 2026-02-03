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
  const velocityX = Math.cos(angle * Math.PI / 180) * SPEED;
  const velocityY = Math.sin(angle * Math.PI / 180) * SPEED;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 设置物理体属性
  ellipse.setCollideWorldBounds(true); // 与世界边界碰撞
  ellipse.body.setBounce(1, 1); // 完全弹性碰撞
  ellipse.body.setCircle(30); // 设置碰撞体为圆形，半径30
}

function update(time, delta) {
  // 保持恒定速度
  const currentSpeed = Math.sqrt(
    ellipse.body.velocity.x ** 2 + 
    ellipse.body.velocity.y ** 2
  );
  
  if (currentSpeed !== 0 && Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    ellipse.setVelocity(
      ellipse.body.velocity.x * scale,
      ellipse.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);