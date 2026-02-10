// 完整的 Phaser3 循环地图游戏
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

// 全局状态变量
let player;
let cursors;
let wrapCount = 0; // 记录循环次数（状态信号）
let wrapText;

function preload() {
  // 使用 Graphics 创建橙色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8800, 1); // 橙色
  graphics.fillRect(0, 0, 40, 40);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();
}

function create() {
  // 创建橙色玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 设置移动速度
  player.body.setMaxVelocity(300, 300);
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 控制
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示循环次数文本
  wrapText = this.add.text(16, 16, 'Wrap Count: 0', {
    fontSize: '24px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加说明文本
  this.add.text(16, 60, 'Use Arrow Keys or WASD to move\nSpeed: 300', {
    fontSize: '16px',
    fill: '#cccccc',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 绘制边界参考线
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0x00ff00, 0.5);
  borderGraphics.strokeRect(0, 0, 800, 600);
}

function update(time, delta) {
  // 重置速度
  player.setVelocity(0);
  
  // 处理键盘输入
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(300);
  }
  
  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-300);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(300);
  }
  
  // 循环地图效果 - 检测边界并从对侧出现
  const playerWidth = player.width;
  const playerHeight = player.height;
  
  // 左右边界循环
  if (player.x > config.width + playerWidth / 2) {
    player.x = -playerWidth / 2;
    wrapCount++;
    updateWrapText();
  } else if (player.x < -playerWidth / 2) {
    player.x = config.width + playerWidth / 2;
    wrapCount++;
    updateWrapText();
  }
  
  // 上下边界循环
  if (player.y > config.height + playerHeight / 2) {
    player.y = -playerHeight / 2;
    wrapCount++;
    updateWrapText();
  } else if (player.y < -playerHeight / 2) {
    player.y = config.height + playerHeight / 2;
    wrapCount++;
    updateWrapText();
  }
}

function updateWrapText() {
  wrapText.setText('Wrap Count: ' + wrapCount);
}

// 启动游戏
new Phaser.Game(config);