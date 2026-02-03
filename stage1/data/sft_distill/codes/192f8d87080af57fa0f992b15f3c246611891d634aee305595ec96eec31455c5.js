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

// 状态变量
let player;
let cursors;
let loopCount = 0; // 可验证的状态信号：记录循环次数
let loopText;

function preload() {
  // 使用 Graphics 创建绿色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('playerTex', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setCollideWorldBounds(false); // 不阻止移出边界
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 显示循环计数器
  loopText = this.add.text(16, 16, 'Loop Count: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });
  
  // 添加说明文字
  this.add.text(16, 50, 'Use Arrow Keys to Move (Speed: 360)', {
    fontSize: '18px',
    fill: '#aaaaaa'
  });
  
  // 显示边界提示
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0xffffff, 0.3);
  borderGraphics.strokeRect(0, 0, 800, 600);
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0, 0);
  
  // 处理键盘输入
  const speed = 360;
  let isMoving = false;
  
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
    isMoving = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
    isMoving = true;
  }
  
  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
    isMoving = true;
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
    isMoving = true;
  }
  
  // 如果同时按下两个方向，归一化速度向量
  if (cursors.left.isDown && cursors.up.isDown ||
      cursors.left.isDown && cursors.down.isDown ||
      cursors.right.isDown && cursors.up.isDown ||
      cursors.right.isDown && cursors.down.isDown) {
    const velocity = player.body.velocity;
    velocity.normalize().scale(speed);
  }
  
  // 循环地图效果 - 检测边界并从对侧出现
  const playerWidth = player.width;
  const playerHeight = player.height;
  
  // 左右边界循环
  if (player.x < -playerWidth / 2) {
    player.x = config.width + playerWidth / 2;
    loopCount++;
    updateLoopText();
  } else if (player.x > config.width + playerWidth / 2) {
    player.x = -playerWidth / 2;
    loopCount++;
    updateLoopText();
  }
  
  // 上下边界循环
  if (player.y < -playerHeight / 2) {
    player.y = config.height + playerHeight / 2;
    loopCount++;
    updateLoopText();
  } else if (player.y > config.height + playerHeight / 2) {
    player.y = -playerHeight / 2;
    loopCount++;
    updateLoopText();
  }
}

function updateLoopText() {
  loopText.setText('Loop Count: ' + loopCount);
}

// 启动游戏
new Phaser.Game(config);