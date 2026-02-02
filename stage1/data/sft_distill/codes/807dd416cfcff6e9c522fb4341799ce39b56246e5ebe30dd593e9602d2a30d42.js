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
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(50, 40, 100, 80); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  
  // 生成纹理
  graphics.generateTexture('orangeEllipse', 100, 80);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成纹理
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'orangeEllipse');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
  ellipse.setVelocity(velocityX, velocityY);
  
  // 设置与世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

new Phaser.Game(config);