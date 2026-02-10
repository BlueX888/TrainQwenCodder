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
let wasd;
let crossCount = 0; // 可验证的状态信号：记录穿越边界次数
let statusText;

function preload() {
  // 使用 Graphics 生成粉色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵（位于屏幕中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 设置玩家速度
  const PLAYER_SPEED = 200;
  player.speed = PLAYER_SPEED;
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示状态信息
  statusText = this.add.text(10, 10, 'Border Crosses: 0', {
    fontSize: '20px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加说明文字
  this.add.text(10, 550, 'Use Arrow Keys or WASD to move', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 处理键盘输入
  if (cursors.left.isDown || wasd.left.isDown) {
    player.setVelocityX(-player.speed);
  } else if (cursors.right.isDown || wasd.right.isDown) {
    player.setVelocityX(player.speed);
  }
  
  if (cursors.up.isDown || wasd.up.isDown) {
    player.setVelocityY(-player.speed);
  } else if (cursors.down.isDown || wasd.down.isDown) {
    player.setVelocityY(player.speed);
  }
  
  // 循环地图效果：检测边界并从对侧出现
  const halfWidth = player.width / 2;
  const halfHeight = player.height / 2;
  
  // 左右边界循环
  if (player.x < -halfWidth) {
    player.x = config.width + halfWidth;
    crossCount++;
    updateStatus();
  } else if (player.x > config.width + halfWidth) {
    player.x = -halfWidth;
    crossCount++;
    updateStatus();
  }
  
  // 上下边界循环
  if (player.y < -halfHeight) {
    player.y = config.height + halfHeight;
    crossCount++;
    updateStatus();
  } else if (player.y > config.height + halfHeight) {
    player.y = -halfHeight;
    crossCount++;
    updateStatus();
  }
}

function updateStatus() {
  statusText.setText('Border Crosses: ' + crossCount);
}

// 启动游戏
new Phaser.Game(config);