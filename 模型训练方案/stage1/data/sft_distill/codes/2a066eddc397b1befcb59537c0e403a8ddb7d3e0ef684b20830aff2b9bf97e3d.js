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
  // 创建青色玩家精灵（物理对象）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  wrapCountText = this.add.text(16, 16, 'Wrap Count: 0', {
    fontSize: '20px',
    fill: '#00ffff'
  });
  
  // 显示控制提示
  this.add.text(16, 50, 'Arrow Keys to Move (Speed: 120)', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 键盘控制移动，速度 120
  if (cursors.left.isDown) {
    player.setVelocityX(-120);
  } else if (cursors.right.isDown) {
    player.setVelocityX(120);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-120);
  } else if (cursors.down.isDown) {
    player.setVelocityY(120);
  }
  
  // 边界循环逻辑
  const playerWidth = player.width;
  const playerHeight = player.height;
  
  // 左边界穿越到右边
  if (player.x < -playerWidth / 2) {
    player.x = config.width + playerWidth / 2;
    wrapCount++;
    updateWrapCount();
  }
  
  // 右边界穿越到左边
  if (player.x > config.width + playerWidth / 2) {
    player.x = -playerWidth / 2;
    wrapCount++;
    updateWrapCount();
  }
  
  // 上边界穿越到下边
  if (player.y < -playerHeight / 2) {
    player.y = config.height + playerHeight / 2;
    wrapCount++;
    updateWrapCount();
  }
  
  // 下边界穿越到上边
  if (player.y > config.height + playerHeight / 2) {
    player.y = -playerHeight / 2;
    wrapCount++;
    updateWrapCount();
  }
}

function updateWrapCount() {
  wrapCountText.setText('Wrap Count: ' + wrapCount);
}

new Phaser.Game(config);