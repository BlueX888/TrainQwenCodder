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
    create: create
  },
  backgroundColor: '#2d2d2d'
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径40像素）
  const radius = 40;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制粉色六边形
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（240速度，斜向移动）
  // 使用勾股定理分解速度：240 = sqrt(vx^2 + vy^2)
  // 这里使用45度角，vx = vy = 240 / sqrt(2) ≈ 169.7
  const velocity = 240 / Math.sqrt(2);
  hexagon.setVelocity(velocity, velocity);
  
  // 设置世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置完全反弹（弹性系数为1）
  hexagon.setBounce(1, 1);
  
  // 添加说明文字
  this.add.text(10, 10, '粉色六边形以240速度移动\n碰到边界时反弹', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

new Phaser.Game(config);