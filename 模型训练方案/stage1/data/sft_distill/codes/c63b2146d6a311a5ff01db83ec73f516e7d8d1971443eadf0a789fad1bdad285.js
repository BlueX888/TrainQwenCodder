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
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00FFFF, 1); // 青色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径为25的圆
  
  // 生成纹理
  graphics.generateTexture('ball', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const ball = this.physics.add.sprite(400, 300, 'ball');
  
  // 设置速度（200像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  ball.setVelocity(velocity.x, velocity.y);
  
  // 设置反弹系数为1（完全弹性碰撞）
  ball.setBounce(1, 1);
  
  // 设置与世界边界碰撞
  ball.setCollideWorldBounds(true);
  
  // 确保圆形碰撞体积准确
  ball.body.setCircle(25);
}

new Phaser.Game(config);