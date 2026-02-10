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
  // 不需要预加载外部资源
}

function create() {
  // 创建六边形纹理
  const graphics = this.add.graphics();
  
  // 计算六边形顶点（半径为30）
  const radius = 30;
  const hexagonPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6; // 从顶部开始，每60度一个顶点
    hexagonPoints.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius
    });
  }
  
  // 绘制红色六边形
  graphics.fillStyle(0xff0000, 1);
  graphics.fillPolygon(hexagonPoints);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  graphics.destroy();
  
  // 创建物理精灵
  const hexagon = this.physics.add.sprite(400, 300, 'hexagon');
  
  // 设置初始速度（160像素/秒，45度角方向）
  // 使用勾股定理：速度分量 = 160 / sqrt(2) ≈ 113
  const speed = 160;
  const velocityComponent = speed / Math.sqrt(2);
  hexagon.setVelocity(velocityComponent, velocityComponent);
  
  // 设置碰撞世界边界
  hexagon.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  hexagon.setBounce(1, 1);
  
  // 确保世界边界启用碰撞
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);