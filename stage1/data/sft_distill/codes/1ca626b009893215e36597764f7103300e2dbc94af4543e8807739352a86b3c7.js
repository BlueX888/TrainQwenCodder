const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: { preload, create, update }
};

function preload() {
  // 使用 Graphics 创建紫色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  graphics.fillEllipse(40, 30, 80, 60); // 椭圆：中心(40,30)，宽80，高60
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  this.ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（120像素/秒，方向为右下45度）
  const speed = 120;
  const angle = Phaser.Math.DegToRad(45);
  this.ellipse.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 启用世界边界碰撞
  this.ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  this.ellipse.setBounce(1, 1);
}

function update(time, delta) {
  // 保持恒定速度（修正物理引擎可能的速度衰减）
  const velocity = this.ellipse.body.velocity;
  const currentSpeed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  
  if (currentSpeed > 0 && Math.abs(currentSpeed - 120) > 0.1) {
    const scale = 120 / currentSpeed;
    this.ellipse.setVelocity(velocity.x * scale, velocity.y * scale);
  }
}

new Phaser.Game(config);