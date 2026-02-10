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
  // 使用 Graphics 绘制灰色六边形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 计算六边形顶点坐标（中心在原点，半径40）
  const radius = 40;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i; // 60度间隔
    hexagonPoints.push({
      x: radius + radius * Math.cos(angle),
      y: radius + radius * Math.sin(angle)
    });
  }
  
  // 绘制六边形
  graphics.fillPoints(hexagonPoints, true);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（240像素/秒，随机方向）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 240;
  const velocityY = Math.sin(angle) * 240;
  hexagon.setVelocity(velocityX, velocityY);
  
  // 设置碰撞边界
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 确保世界边界碰撞已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);