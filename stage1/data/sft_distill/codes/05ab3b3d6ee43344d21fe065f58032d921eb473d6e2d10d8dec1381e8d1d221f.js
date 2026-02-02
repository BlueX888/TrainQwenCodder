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
  // 使用 Graphics 绘制橙色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  
  // 将 Graphics 转换为纹理
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');
  
  // 设置初始速度 (200速度，可以是任意方向)
  ellipse.setVelocity(200, 150);
  
  // 设置完全反弹 (bounce = 1 表示完全弹性碰撞)
  ellipse.setBounce(1, 1);
  
  // 设置与世界边界碰撞
  ellipse.setCollideWorldBounds(true);
  
  // 确保世界边界与画布大小一致
  this.physics.world.setBounds(0, 0, 800, 600);
}

new Phaser.Game(config);