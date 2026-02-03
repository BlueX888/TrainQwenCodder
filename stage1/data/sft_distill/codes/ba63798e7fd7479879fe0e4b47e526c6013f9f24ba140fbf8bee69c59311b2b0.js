const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（正六边形，半径40）
  const hexRadius = 40;
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
    hexPoints.push({
      x: hexRadius + Math.cos(angle) * hexRadius,
      y: hexRadius + Math.sin(angle) * hexRadius
    });
  }
  
  // 绘制灰色六边形
  graphics.fillStyle(0x808080, 1);
  graphics.beginPath();
  graphics.moveTo(hexPoints[0].x, hexPoints[0].y);
  for (let i = 1; i < hexPoints.length; i++) {
    graphics.lineTo(hexPoints[i].x, hexPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', hexRadius * 2, hexRadius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（240速度，斜向移动）
  const speed = 240;
  const angle = Math.PI / 4; // 45度角
  hexagon.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置碰撞属性
  hexagon.setCollideWorldBounds(true); // 与世界边界碰撞
  hexagon.setBounce(1, 1); // X和Y方向完全反弹
  
  // 确保物理体大小匹配纹理
  hexagon.body.setSize(hexRadius * 1.5, hexRadius * 1.5);
}

new Phaser.Game(config);