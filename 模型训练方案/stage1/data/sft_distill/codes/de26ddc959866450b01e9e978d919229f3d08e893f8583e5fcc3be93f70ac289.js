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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建橙色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFA500, 1); // 橙色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的方块
  graphics.generateTexture('orangeSquare', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵
  const square = this.physics.add.sprite(400, 300, 'orangeSquare');
  
  // 设置速度为120（斜向移动，使 x 和 y 方向的合速度约为120）
  const speed = 120;
  const angle = Math.PI / 4; // 45度角
  square.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
}

new Phaser.Game(config);