const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
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
  }
};

let player;
let cursors;
const PLAYER_SPEED = 80;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制青色圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(20, 20, 20); // 在 (20, 20) 位置绘制半径为 20 的圆
  graphics.generateTexture('playerCircle', 40, 40);
  graphics.destroy();

  // 创建玩家精灵，位置在画布中心
  player = this.physics.add.sprite(400, 300, 'playerCircle');
  
  // 设置碰撞世界边界
  player.setCollideWorldBounds(true);
  
  // 创建方向键控制
  cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 检测方向键并设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }
  
  // 如果同时按下两个方向键，需要归一化速度以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }
}

new Phaser.Game(config);