const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 不需要重力
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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的方块
  graphics.generateTexture('pinkSquare', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建物理精灵，放置在画布中心
  const square = this.physics.add.sprite(400, 300, 'pinkSquare');
  
  // 设置初始速度（200速度，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 200);
  square.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
  
  // 可选：添加提示文本
  this.add.text(10, 10, 'Pink square bouncing at 200 speed', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

// 启动游戏
new Phaser.Game(config);