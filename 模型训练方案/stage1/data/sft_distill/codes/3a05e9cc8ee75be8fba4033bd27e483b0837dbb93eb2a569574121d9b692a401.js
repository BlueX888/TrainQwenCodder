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
  // 使用 Graphics 绘制紫色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9966ff, 1); // 紫色
  
  // 绘制星形（中心点在 40, 40，半径 40）
  graphics.fillStar(40, 40, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('starTexture', 80, 80);
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'starTexture');
  
  // 设置世界边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为 1（完全弹性碰撞）
  star.setBounce(1, 1);
  
  // 设置初始速度为 160（随机方向）
  const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
  const velocityX = Math.cos(angle) * 160;
  const velocityY = Math.sin(angle) * 160;
  star.setVelocity(velocityX, velocityY);
}

new Phaser.Game(config);