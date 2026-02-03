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
  // 使用 Graphics 绘制紫色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  
  // 绘制星形（中心点在 50, 50，半径为 40）
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（160像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 160);
  star.setVelocity(velocity.x, velocity.y);
  
  // 设置与世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  star.setBounce(1, 1);
}

new Phaser.Game(config);