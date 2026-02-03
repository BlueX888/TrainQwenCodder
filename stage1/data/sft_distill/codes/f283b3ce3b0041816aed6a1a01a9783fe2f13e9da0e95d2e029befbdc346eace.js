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
const SPEED = 360;

function preload() {
  // 使用 Graphics 创建青色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('playerBlock', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建物理精灵
  player = this.physics.add.sprite(400, 300, 'playerBlock');
  
  // 设置精灵与世界边界碰撞
  player.setCollideWorldBounds(true);
  
  // 设置世界边界
  this.physics.world.setBounds(0, 0, 800, 600);
  
  // 创建方向键输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 根据方向键设置速度
  if (cursors.left.isDown) {
    player.setVelocityX(-SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(SPEED);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(SPEED);
  }
  
  // 如果同时按下两个方向键，需要归一化速度以保持恒定速度
  if ((cursors.left.isDown || cursors.right.isDown) && 
      (cursors.up.isDown || cursors.down.isDown)) {
    player.body.velocity.normalize().scale(SPEED);
  }
}

new Phaser.Game(config);