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
  
  // 计算六边形顶点（半径50）
  const radius = 50;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexagonPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制青色六边形
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.beginPath();
  graphics.moveTo(hexagonPoints[0].x, hexagonPoints[0].y);
  for (let i = 1; i < hexagonPoints.length; i++) {
    graphics.lineTo(hexagonPoints[i].x, hexagonPoints[i].y);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建带物理属性的六边形精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置速度（随机方向，速度为160）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 160);
  hexagon.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  hexagon.setCollideWorldBounds(true);
  hexagon.setBounce(1, 1); // 完全弹性碰撞
  
  // 确保物理世界边界与画布一致
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);