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
  // 使用 Graphics 绘制白色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制菱形路径（中心在 32, 32，大小为 64x64）
  const path = new Phaser.Geom.Polygon([
    32, 0,    // 顶点
    64, 32,   // 右点
    32, 64,   // 底点
    0, 32     // 左点
  ]);
  
  graphics.fillPoints(path.points, true);
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('diamond', 64, 64);
  graphics.destroy();
  
  // 创建物理精灵
  const diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置初始速度（160像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  this.physics.velocityFromAngle(angle, 160, diamond.body.velocity);
  
  // 启用世界边界碰撞
  diamond.setCollideWorldBounds(true);
  
  // 设置边界反弹系数为1（完全弹性碰撞）
  diamond.setBounce(1, 1);
}

new Phaser.Game(config);