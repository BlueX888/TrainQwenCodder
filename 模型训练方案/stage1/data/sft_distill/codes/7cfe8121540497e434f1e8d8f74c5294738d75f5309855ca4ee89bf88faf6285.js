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
const SPEED = 120;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制椭圆 (中心在原点，宽60，高40)
  const ellipseWidth = 60;
  const ellipseHeight = 40;
  graphics.fillEllipse(ellipseWidth / 2, ellipseHeight / 2, ellipseWidth / 2, ellipseHeight / 2);
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', ellipseWidth, ellipseHeight);
  graphics.destroy();
  
  // 创建物理精灵
  ellipse = this.physics.add.sprite(400, 300, 'ellipseTex');
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 设置初始速度（斜向移动）
  const angle = Phaser.Math.DegToRad(45); // 45度角
  ellipse.setVelocity(
    Math.cos(angle) * SPEED,
    Math.sin(angle) * SPEED
  );
}

function update(time, delta) {
  // 保持速度恒定为120
  const currentVelocity = ellipse.body.velocity;
  const currentSpeed = Math.sqrt(
    currentVelocity.x * currentVelocity.x + 
    currentVelocity.y * currentVelocity.y
  );
  
  // 如果速度发生变化，重新归一化到120
  if (Math.abs(currentSpeed - SPEED) > 0.1) {
    const scale = SPEED / currentSpeed;
    ellipse.setVelocity(
      currentVelocity.x * scale,
      currentVelocity.y * scale
    );
  }
}

new Phaser.Game(config);