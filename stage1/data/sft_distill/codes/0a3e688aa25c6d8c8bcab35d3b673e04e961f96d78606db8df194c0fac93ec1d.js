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
  }
};

function preload() {
  // 使用 Graphics 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50); // 50x50 的方块
  graphics.generateTexture('yellowSquare', 50, 50);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
}

function create() {
  // 创建物理精灵
  const square = this.physics.add.sprite(400, 300, 'yellowSquare');
  
  // 设置初始速度（160像素/秒，随机方向）
  const angle = Phaser.Math.Between(0, 360);
  const velocityX = Math.cos(angle * Math.PI / 180) * 160;
  const velocityY = Math.sin(angle * Math.PI / 180) * 160;
  square.setVelocity(velocityX, velocityY);
  
  // 设置边界碰撞
  square.setCollideWorldBounds(true);
  
  // 设置反弹系数为1，实现完美反弹
  square.setBounce(1, 1);
  
  // 可选：移除摩擦力，保持恒定速度
  square.body.setDamping(false);
}

new Phaser.Game(config);