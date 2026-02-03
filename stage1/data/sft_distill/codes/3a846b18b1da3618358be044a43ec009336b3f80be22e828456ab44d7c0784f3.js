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
  // 创建白色菱形纹理
  const graphics = this.add.graphics();
  
  // 设置白色填充
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形路径（中心点在32,32，边长约45像素）
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
}

function create() {
  // 创建物理精灵
  const diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置初始速度（160像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 160;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 160;
  diamond.setVelocity(velocityX, velocityY);
  
  // 设置与世界边界碰撞
  diamond.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  diamond.setBounce(1, 1);
  
  // 可选：添加旋转效果使运动更生动
  diamond.setAngularVelocity(50);
}

new Phaser.Game(config);