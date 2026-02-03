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
  // 使用 Graphics 绘制黄色椭圆并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillEllipse(40, 30, 80, 60); // 绘制椭圆（中心点，宽度，高度）
  graphics.generateTexture('ellipse', 80, 60);
  graphics.destroy();

  // 创建物理精灵
  const ellipse = this.physics.add.sprite(400, 300, 'ellipse');

  // 设置初始速度（随机方向，速度大小为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 200;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 200;
  ellipse.setVelocity(velocityX, velocityY);

  // 设置碰撞世界边界
  ellipse.setCollideWorldBounds(true);

  // 设置反弹系数为1（完全弹性碰撞）
  ellipse.setBounce(1, 1);
}

new Phaser.Game(config);