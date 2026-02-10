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
  // 使用 Graphics 绘制白色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 计算六边形顶点（半径为30）
  const radius = 30;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    const x = radius + Math.cos(angle) * radius;
    const y = radius + Math.sin(angle) * radius;
    hexagonPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.beginPath();
  graphics.moveTo(hexagonPoints[0], hexagonPoints[1]);
  for (let i = 2; i < hexagonPoints.length; i += 2) {
    graphics.lineTo(hexagonPoints[i], hexagonPoints[i + 1]);
  }
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建带物理引擎的六边形精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
  hexagon.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 可选：添加旋转效果使运动更有趣
  hexagon.setAngularVelocity(100);
}

new Phaser.Game(config);