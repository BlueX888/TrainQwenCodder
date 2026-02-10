const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },  // 不需要重力
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
  // 使用 Graphics 绘制绿色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);  // 绿色
  graphics.fillCircle(25, 25, 25);  // 在中心绘制半径为25的圆
  
  // 生成纹理
  graphics.generateTexture('circle', 50, 50);
  graphics.destroy();  // 销毁 graphics 对象，节省资源
  
  // 创建物理精灵
  const circle = this.physics.add.sprite(400, 300, 'circle');
  
  // 设置初始速度（随机方向，速度为300）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 300);
  circle.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  circle.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  circle.setBounce(1, 1);
}

// 创建游戏实例
new Phaser.Game(config);