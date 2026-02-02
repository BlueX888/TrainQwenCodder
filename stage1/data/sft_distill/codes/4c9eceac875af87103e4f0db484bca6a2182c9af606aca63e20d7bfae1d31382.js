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
  // 创建 Graphics 对象绘制黄色菱形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制菱形路径（中心点为 32, 32，尺寸为 64x64）
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
  
  // 创建物理精灵对象
  const diamond = this.physics.add.sprite(400, 300, 'diamond');
  
  // 设置初始速度（随机方向，速度为80）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const vx = Math.cos(angle) * 80;
  const vy = Math.sin(angle) * 80;
  diamond.setVelocity(vx, vy);
  
  // 设置反弹系数为1（完全弹性碰撞）
  diamond.setBounce(1, 1);
  
  // 启用世界边界碰撞
  diamond.setCollideWorldBounds(true);
}

new Phaser.Game(config);