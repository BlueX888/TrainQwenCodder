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
  // 使用 Graphics 绘制白色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形路径（中心点在32, 32，边长约45像素）
  const path = new Phaser.Geom.Polygon([
    32, 0,    // 上顶点
    64, 32,   // 右顶点
    32, 64,   // 下顶点
    0, 32     // 左顶点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 生成纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建启用物理的精灵
  const diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置速度（使用勾股定理：160 = sqrt(vx^2 + vy^2)）
  // vx = vy = 160 / sqrt(2) ≈ 113.137
  const velocity = 160 / Math.sqrt(2);
  diamond.setVelocity(velocity, velocity);
  
  // 启用世界边界碰撞
  diamond.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  diamond.setBounce(1, 1);
}

new Phaser.Game(config);