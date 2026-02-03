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
let wrapCount = 0; // 状态信号：记录穿越边界次数
let wrapCountText;

function preload() {
  // 使用 Graphics 创建青色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  wrapCountText = this.add.text(16, 16, 'Wraps: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 添加说明文字
  this.add.text(16, 50, 'Use Arrow Keys to Move\nSpeed: 80 pixels/sec', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
  
  // 显示边界提示
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0xffff00, 0.5);
  graphics.strokeRect(0, 0, config.width, config.height);
}

function update() {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 键盘控制移动（速度80）
  if (cursors.left.isDown) {
    player.setVelocityX(-80);
  } else if (cursors.right.isDown) {
    player.setVelocityX(80);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-80);
  } else if (cursors.down.isDown) {
    player.setVelocityY(80);
  }
  
  // 边界循环逻辑
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  // 左右边界循环
  if (player.x < -halfWidth) {
    player.x = config.width + halfWidth;
    wrapCount++;
    updateWrapCount();
  } else if (player.x > config.width + halfWidth) {
    player.x = -halfWidth;
    wrapCount++;
    updateWrapCount();
  }
  
  // 上下边界循环
  if (player.y < -halfHeight) {
    player.y = config.height + halfHeight;
    wrapCount++;
    updateWrapCount();
  } else if (player.y > config.height + halfHeight) {
    player.y = -halfHeight;
    wrapCount++;
    updateWrapCount();
  }
}

function updateWrapCount() {
  wrapCountText.setText('Wraps: ' + wrapCount);
}

new Phaser.Game(config);