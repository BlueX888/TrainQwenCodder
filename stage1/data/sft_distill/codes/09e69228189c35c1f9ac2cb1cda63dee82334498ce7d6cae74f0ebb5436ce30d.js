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
  },
  backgroundColor: '#2d2d2d'
};

let ellipse;
const SPEED = 200;

function preload() {
  // 使用 Graphics 生成黄色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillEllipse(40, 30, 80, 60); // 中心点和宽高
  graphics.generateTexture('yellowEllipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  ellipse = this.physics.add.sprite(400, 300, 'yellowEllipse');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * SPEED;
  const velocityY = Math.sin(angle * Math.PI / 180) * SPEED;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 设置与世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

function update(time, delta) {
  // 保持恒定速度（防止因碰撞导致速度衰减）
  const currentVelocity = ellipse.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度发生变化，重新标准化到目标速度
  if (Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    ellipse.setVelocity(
      currentVelocity.x * scale,
      currentVelocity.y * scale
    );
  }
}

new Phaser.Game(config);