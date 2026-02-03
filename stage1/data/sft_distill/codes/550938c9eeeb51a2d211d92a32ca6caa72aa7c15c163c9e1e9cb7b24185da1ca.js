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
  }
};

let player;
let cursors;
let wrapCount = 0; // 状态信号：记录穿越边界次数
let wrapCountText;

function preload() {
  // 使用 Graphics 创建绿色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('playerTexture', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerTexture');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示状态信息
  wrapCountText = this.add.text(16, 16, 'Wrap Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 添加说明文字
  this.add.text(16, 50, 'Use Arrow Keys to Move (Speed: 160)', {
    fontSize: '16px',
    fill: '#cccccc'
  });
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  const speed = 160;
  
  // 处理键盘输入
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 处理边界循环（wrap around）
  const playerWidth = player.width;
  const playerHeight = player.height;
  
  // 左右边界循环
  if (player.x > config.width + playerWidth / 2) {
    player.x = -playerWidth / 2;
    wrapCount++;
    updateWrapCountText();
  } else if (player.x < -playerWidth / 2) {
    player.x = config.width + playerWidth / 2;
    wrapCount++;
    updateWrapCountText();
  }
  
  // 上下边界循环
  if (player.y > config.height + playerHeight / 2) {
    player.y = -playerHeight / 2;
    wrapCount++;
    updateWrapCountText();
  } else if (player.y < -playerHeight / 2) {
    player.y = config.height + playerHeight / 2;
    wrapCount++;
    updateWrapCountText();
  }
}

function updateWrapCountText() {
  wrapCountText.setText('Wrap Count: ' + wrapCount);
}

new Phaser.Game(config);