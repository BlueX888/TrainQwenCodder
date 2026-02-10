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
  // 使用 Graphics 创建红色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('redSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  const square = this.physics.add.sprite(400, 300, 'redSquare');
  
  // 设置初始速度（斜向移动，总速度约为80）
  const speed = 80;
  const angle = Math.PI / 4; // 45度角
  square.setVelocity(
    Math.cos(angle) * speed,
    Math.sin(angle) * speed
  );
  
  // 设置与世界边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1（完全弹性碰撞）
  square.setBounce(1, 1);
  
  // 添加文字说明
  this.add.text(10, 10, 'Red square bouncing at speed 80', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);