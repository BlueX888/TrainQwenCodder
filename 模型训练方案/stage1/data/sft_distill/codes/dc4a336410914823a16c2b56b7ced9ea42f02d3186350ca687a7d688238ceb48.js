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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  
  // 绘制椭圆（中心点在 40, 30，半径为 40x30）
  graphics.fillEllipse(40, 30, 80, 60);
  
  // 生成纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度（速度为200，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 200;
  const velocityY = Math.sin(angle * Math.PI / 180) * 200;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 启用与世界边界的碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
  
  // 确保世界边界碰撞已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);