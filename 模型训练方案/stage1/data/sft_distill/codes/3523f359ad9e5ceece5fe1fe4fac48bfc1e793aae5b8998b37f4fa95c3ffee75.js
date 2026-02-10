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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制椭圆（中心点在 60, 40，宽度 120，高度 80）
  graphics.fillEllipse(60, 40, 120, 80);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  graphics.destroy();
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（200 像素/秒，方向为右下方）
  ellipse.setVelocity(200, 200);
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

new Phaser.Game(config);