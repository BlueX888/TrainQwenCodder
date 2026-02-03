const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('blueSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  const square = this.physics.add.sprite(400, 300, 'blueSquare');
  
  // 设置初始速度（随机方向，速度为200）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  square.setVelocity(velocity.x, velocity.y);
  
  // 设置世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
  
  // 存储方块引用供 update 使用（如果需要）
  this.square = square;
}

function update(time, delta) {
  // 物理系统自动处理移动和碰撞，无需手动更新
}

// 启动游戏
new Phaser.Game(config);