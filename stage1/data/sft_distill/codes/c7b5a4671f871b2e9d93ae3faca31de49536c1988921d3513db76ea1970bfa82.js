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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('pinkSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  const square = this.physics.add.sprite(400, 300, 'pinkSquare');
  
  // 设置初始速度 (200速度，随机方向)
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 200;
  const velocityY = Math.sin(angle * Math.PI / 180) * 200;
  square.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

new Phaser.Game(config);