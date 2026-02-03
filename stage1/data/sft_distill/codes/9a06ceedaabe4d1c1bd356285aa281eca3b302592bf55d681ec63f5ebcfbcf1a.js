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
  // 使用 Graphics 创建绿色椭圆纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  graphics.generateTexture('greenEllipse', 80, 60);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'greenEllipse');
  
  // 设置初始速度 (使用勾股定理使合速度约为120)
  // 120 = sqrt(vx^2 + vy^2)
  // 设置为 (85, 85) 约等于 120
  ellipse.setVelocity(85, 85);
  
  // 设置边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完美反弹
  ellipse.setBounce(1, 1);
  
  // 确保世界边界已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);