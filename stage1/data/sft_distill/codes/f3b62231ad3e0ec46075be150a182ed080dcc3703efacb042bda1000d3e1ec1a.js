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

let player;
let cursors;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(25, 25, 25); // 圆心在 (25, 25)，半径 25
  
  // 生成纹理
  graphics.generateTexture('playerCircle', 50, 50);
  graphics.destroy();
  
  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'playerCircle');
  
  // 设置碰撞边界，限制在画布内
  player.setCollideWorldBounds(true);
  
  // 设置圆形物理体（更精确的碰撞检测）
  player.body.setCircle(25);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-300);
  } else if (cursors.down.isDown) {
    player.setVelocityY(300);
  }
  
  // 如果同时按下两个方向键，需要归一化速度向量以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(300);
  }
}

new Phaser.Game(config);