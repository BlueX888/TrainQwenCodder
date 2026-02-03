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
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

let square;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建灰色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('square', 50, 50);
  graphics.destroy();

  // 创建物理精灵
  square = this.physics.add.sprite(400, 300, 'square');
  
  // 设置初始速度（随机方向，速度为360）
  const angle = Phaser.Math.Between(0, 360);
  const velocity = this.physics.velocityFromAngle(angle, 360);
  square.setVelocity(velocity.x, velocity.y);
  
  // 设置碰撞边界
  square.setCollideWorldBounds(false); // 手动处理边界反弹
}

function update() {
  // 检测左右边界
  if (square.x <= 25 || square.x >= 775) {
    square.setVelocityX(-square.body.velocity.x);
    // 修正位置防止卡在边界外
    if (square.x <= 25) {
      square.x = 25;
    } else {
      square.x = 775;
    }
  }
  
  // 检测上下边界
  if (square.y <= 25 || square.y >= 575) {
    square.setVelocityY(-square.body.velocity.y);
    // 修正位置防止卡在边界外
    if (square.y <= 25) {
      square.y = 25;
    } else {
      square.y = 575;
    }
  }
}

new Phaser.Game(config);