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
  // 无需预加载外部资源
}

function create() {
  // 创建六边形的顶点坐标（半径为30的正六边形）
  const hexRadius = 30;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexPoints.push({
      x: hexRadius * Math.cos(angle),
      y: hexRadius * Math.sin(angle)
    });
  }

  // 使用 Graphics 绘制绿色六边形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.lineStyle(2, 0x00cc00, 1); // 深绿色边框
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x + hexRadius, hexPoints[0].y + hexRadius);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x + hexRadius, hexPoints[i].y + hexRadius);
  }
  graphics.closePath();
  graphics.fillPath();
  graphics.strokePath();

  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();

  // 创建物理精灵对象
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');

  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 200;
  const velocityY = Math.sin(angle) * 200;
  hexagon.setVelocity(velocityX, velocityY);

  // 启用世界边界碰撞
  hexagon.setCollideWorldBounds(true);

  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);

  // 添加说明文字
  this.add.text(10, 10, '绿色六边形以200速度移动\n碰到边界时反弹', {
    fontSize: '16px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

new Phaser.Game(config);