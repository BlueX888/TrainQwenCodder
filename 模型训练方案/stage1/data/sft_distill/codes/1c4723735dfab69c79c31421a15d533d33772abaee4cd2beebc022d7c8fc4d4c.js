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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制粉色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  
  // 计算六边形的顶点（中心在 50, 50，半径 40）
  const hexRadius = 40;
  const centerX = 50;
  const centerY = 50;
  const hexPoints = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillPoints(hexPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  const hexSprite = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（随机方向，速度240）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 240);
  hexSprite.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞
  hexSprite.setCollideWorldBounds(true);
  hexSprite.setBounce(1, 1); // 完全弹性碰撞
  
  // 可选：添加旋转效果使运动更生动
  hexSprite.setAngularVelocity(50);
}

new Phaser.Game(config);