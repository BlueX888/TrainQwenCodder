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
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  
  // 计算六边形顶点（半径40）
  const radius = 40;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
    hexagonPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制六边形
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
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置圆形碰撞体（更接近六边形的碰撞效果）
  hexagon.setCircle(radius * 0.9);
  
  // 计算随机方向的速度（速度大小为360）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 360;
  const velocityY = Math.sin(angle) * 360;
  
  // 设置初始速度
  hexagon.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 可选：添加一些视觉效果（旋转）
  this.tweens.add({
    targets: hexagon,
    angle: 360,
    duration: 2000,
    repeat: -1,
    ease: 'Linear'
  });
}

new Phaser.Game(config);