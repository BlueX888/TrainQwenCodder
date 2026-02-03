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
  // 使用 Graphics 绘制黄色方块
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的方块
  
  // 生成纹理
  graphics.generateTexture('yellowSquare', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建物理精灵
  const square = this.physics.add.sprite(400, 300, 'yellowSquare');
  
  // 设置初始速度（随机方向，速度为160）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 160);
  square.setVelocity(velocity.x, velocity.y);
  
  // 启用世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

// 创建游戏实例
new Phaser.Game(config);