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
  // 使用 Graphics 绘制绿色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  
  // 绘制椭圆（中心点在 60, 40，半径 60x40）
  graphics.fillEllipse(60, 40, 120, 80);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 120, 80);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（随机方向，速度为 120）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 120;
  const velocityY = Math.sin(angle) * 120;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 启用世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 可选：添加文字说明
  this.add.text(10, 10, '绿色椭圆以 120 速度移动并反弹', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);