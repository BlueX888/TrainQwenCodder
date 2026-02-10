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

let star;
const SPEED = 360;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制星形（5个尖角）
  const points = [];
  const outerRadius = 30;
  const innerRadius = 15;
  const numPoints = 5;
  
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (i * Math.PI) / numPoints - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: 40 + Math.cos(angle) * radius,
      y: 40 + Math.sin(angle) * radius
    });
  }
  
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('starTexture', 80, 80);
  graphics.destroy();
  
  // 创建物理精灵
  star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置随机初始速度方向，但保持速度大小为360
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  star.setVelocity(
    Math.cos(angle) * SPEED,
    Math.sin(angle) * SPEED
  );
  
  // 设置与世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  star.setBounce(1, 1);
}

function update(time, delta) {
  // 保持恒定速度（修正由于浮点数误差导致的速度变化）
  const currentSpeed = Math.sqrt(
    star.body.velocity.x ** 2 + star.body.velocity.y ** 2
  );
  
  if (Math.abs(currentSpeed - SPEED) > 1) {
    const scale = SPEED / currentSpeed;
    star.setVelocity(
      star.body.velocity.x * scale,
      star.body.velocity.y * scale
    );
  }
}

new Phaser.Game(config);