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
  // 创建物理精灵
  const square = this.physics.add.sprite(400, 300, 'redSquare');
  
  // 设置初始速度（200像素/秒，方向为右下45度）
  square.setVelocity(200, 200);
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
  
  // 确保世界边界已启用
  this.physics.world.setBoundsCollision(true, true, true, true);
}

new Phaser.Game(config);