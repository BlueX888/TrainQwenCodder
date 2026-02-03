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
  // 无需预加载外部资源
}

function create() {
  // 创建橙色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 半径25的圆形
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'orangeCircle');
  
  // 设置初始速度（随机方向，速度为120）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 120);
  circle.setVelocity(velocity.x, velocity.y);
  
  // 设置边界碰撞和反弹
  circle.setCollideWorldBounds(true); // 与世界边界碰撞
  circle.setBounce(1, 1); // 完全弹性碰撞（反弹系数为1）
  
  // 可选：设置圆形的物理体为圆形（更精确的碰撞检测）
  circle.body.setCircle(25);
}

new Phaser.Game(config);