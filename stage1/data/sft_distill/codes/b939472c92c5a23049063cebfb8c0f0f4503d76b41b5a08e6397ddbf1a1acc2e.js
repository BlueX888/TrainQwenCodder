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
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  
  // 绘制椭圆（中心在 50, 30，半径 50x30）
  graphics.fillEllipse(50, 30, 100, 60);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 100, 60);
  graphics.destroy();
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 200;
  const velocityY = Math.sin(angle) * 200;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

new Phaser.Game(config);