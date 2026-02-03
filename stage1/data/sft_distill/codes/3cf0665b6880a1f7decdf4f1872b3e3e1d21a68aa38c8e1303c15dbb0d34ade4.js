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
  // 使用 Graphics 绘制红色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径25的圆
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'redCircle');
  
  // 设置初始速度（300像素/秒，45度角方向）
  const speed = 300;
  const angle = Phaser.Math.DegToRad(45);
  circle.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置边界碰撞和反弹
  circle.setCollideWorldBounds(true);
  circle.setBounce(1, 1); // 完全弹性碰撞
  
  // 确保世界边界启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);