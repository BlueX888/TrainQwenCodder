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
const SPEED = 360;

function preload() {
  // 使用 Graphics 创建灰色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(40, 30, 80, 60); // 椭圆：宽80，高60
  graphics.generateTexture('ellipseTex', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵，初始位置在画布中心
  ellipse = this.physics.add.sprite(400, 300, 'ellipseTex');
  
  // 设置初始速度（随机方向，速度为360）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * SPEED;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * SPEED;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 设置与世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

function update(time, delta) {
  // 保持恒定速度（修正因碰撞可能产生的速度变化）
  const velocity = ellipse.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed !== 0 && Math.abs(currentSpeed - SPEED) > 1) {
    const scale = SPEED / currentSpeed;
    ellipse.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);