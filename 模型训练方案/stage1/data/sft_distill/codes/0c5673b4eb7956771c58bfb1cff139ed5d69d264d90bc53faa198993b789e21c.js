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
  // 使用 Graphics 绘制橙色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillCircle(25, 25, 25); // 在中心绘制半径为25的圆
  
  // 生成纹理
  graphics.generateTexture('orangeCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，释放内存
  
  // 创建物理精灵，位置在画布中心
  const circle = this.physics.add.sprite(400, 300, 'orangeCircle');
  
  // 设置圆形为圆形碰撞体（更精确的碰撞检测）
  circle.setCircle(25);
  
  // 设置初始速度（120像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 120);
  circle.setVelocity(velocity.x, velocity.y);
  
  // 设置完全反弹（弹性系数为1）
  circle.setBounce(1, 1);
  
  // 启用世界边界碰撞
  circle.setCollideWorldBounds(true);
}

// 创建游戏实例
new Phaser.Game(config);