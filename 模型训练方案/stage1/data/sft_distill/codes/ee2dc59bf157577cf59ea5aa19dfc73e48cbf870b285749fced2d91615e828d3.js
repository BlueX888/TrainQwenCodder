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

let hexagon;
const SPEED = 240;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 绘制六边形（中心点为原点）
  const size = 30;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = size + Math.cos(angle) * size;
    const y = size + Math.sin(angle) * size;
    points.push(new Phaser.Math.Vector2(x, y));
  }
  
  graphics.fillPoints(points, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', size * 2, size * 2);
  graphics.destroy();
  
  // 创建带物理属性的六边形精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * SPEED;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * SPEED;
  
  hexagon.setVelocity(velocityX, velocityY);
  
  // 设置碰撞边界
  hexagon.setCollideWorldBounds(true);
  hexagon.setBounce(1, 1); // 完全弹性碰撞
}

function update(time, delta) {
  // 检查边界并反转速度（额外保险，因为 setBounce 和 setCollideWorldBounds 已处理）
  // 但为了确保速度恒定为 240，我们手动处理
  const body = hexagon.body;
  
  // 左右边界
  if (hexagon.x <= hexagon.width / 2 && body.velocity.x < 0) {
    body.velocity.x = Math.abs(body.velocity.x);
  } else if (hexagon.x >= config.width - hexagon.width / 2 && body.velocity.x > 0) {
    body.velocity.x = -Math.abs(body.velocity.x);
  }
  
  // 上下边界
  if (hexagon.y <= hexagon.height / 2 && body.velocity.y < 0) {
    body.velocity.y = Math.abs(body.velocity.y);
  } else if (hexagon.y >= config.height - hexagon.height / 2 && body.velocity.y > 0) {
    body.velocity.y = -Math.abs(body.velocity.y);
  }
  
  // 保持速度恒定为 240
  const currentSpeed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
  if (currentSpeed > 0 && Math.abs(currentSpeed - SPEED) > 1) {
    body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);