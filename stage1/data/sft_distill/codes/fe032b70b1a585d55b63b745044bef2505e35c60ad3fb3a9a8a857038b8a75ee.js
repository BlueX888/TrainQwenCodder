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
  // 使用 Graphics 绘制青色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制星形（5个顶点，外半径40，内半径20）
  graphics.fillStar(50, 50, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy();
  
  // 创建物理精灵
  const star = this.physics.add.sprite(400, 300, 'star');
  
  // 设置初始速度（240速度，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * 240;
  const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * 240;
  star.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  star.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  star.setBounce(1, 1);
}

new Phaser.Game(config);