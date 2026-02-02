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
  
  // 计算六边形顶点（半径40像素）
  const radius = 40;
  const sides = 6;
  const hexPoints = [];
  
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
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
  const speed = 240;
  const angle = Phaser.Math.DegToRad(45); // 45度角
  hexagon.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置边界碰撞
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 确保世界边界启用碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);