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
  // 使用 Graphics 生成红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵，放置在画布中心
  const square = this.physics.add.sprite(400, 300, 'redSquare');
  
  // 设置初始速度（斜向移动，速度大小约为200）
  // 使用勾股定理：sqrt(141^2 + 141^2) ≈ 200
  square.setVelocity(141, 141);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完美弹性碰撞）
  square.setBounce(1, 1);
}

new Phaser.Game(config);