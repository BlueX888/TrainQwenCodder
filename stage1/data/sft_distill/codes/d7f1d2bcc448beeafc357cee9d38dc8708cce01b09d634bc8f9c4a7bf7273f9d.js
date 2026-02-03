const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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

let hexagon;
let velocity = { x: 200, y: 200 };

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用Graphics绘制六边形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 计算六边形的顶点（半径为30）
  const radius = 30;
  const sides = 6;
  const points = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
    points.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    graphics.lineTo(points[i].x, points[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度
  hexagon.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  hexagon.setCollideWorldBounds(true);
  hexagon.setBounce(1, 1);
}

function update() {
  // Arcade物理引擎的setBounce和setCollideWorldBounds已经处理了反弹
  // 但为了确保速度恒定，我们手动检测并保持速度大小
  const currentVelocity = hexagon.body.velocity;
  const speed = 200;
  
  // 归一化速度向量并乘以固定速度
  const magnitude = Math.sqrt(currentVelocity.x * currentVelocity.x + currentVelocity.y * currentVelocity.y);
  
  if (magnitude > 0 && Math.abs(magnitude - speed) > 1) {
    hexagon.setVelocity(
      (currentVelocity.x / magnitude) * speed,
      (currentVelocity.y / magnitude) * speed
    );
  }
}

new Phaser.Game(config);