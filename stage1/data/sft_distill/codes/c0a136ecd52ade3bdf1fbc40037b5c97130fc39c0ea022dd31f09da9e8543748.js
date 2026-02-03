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
let wrapText;

function preload() {
  // 使用 Graphics 创建绿色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('playerTex', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵（绿色方块）
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 键支持
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示穿越次数
  wrapText = this.add.text(16, 16, 'Wrap Count: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });
  
  // 显示控制说明
  this.add.text(16, 50, 'Use Arrow Keys or WASD to move', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
  
  // 显示边界参考线
  const graphics = this.add.graphics();
  graphics.lineStyle(2, 0x666666, 0.5);
  graphics.strokeRect(0, 0, 800, 600);
}

function update() {
  // 重置速度
  player.setVelocity(0, 0);
  
  const speed = 360;
  
  // 处理方向键输入（支持方向键和WASD）
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(speed);
  }
  
  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(speed);
  }
  
  // 处理边界循环（wrap around）
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

// 创建游戏实例
new Phaser.Game(config);