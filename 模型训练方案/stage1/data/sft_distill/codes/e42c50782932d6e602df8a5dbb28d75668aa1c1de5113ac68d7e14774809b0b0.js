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
let statusText;
const PLAYER_SPEED = 360;

// 状态信号变量
let playerX = 0;
let playerY = 0;
let wrapCount = 0; // 记录循环次数

function preload() {
  // 使用 Graphics 创建青色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00FFFF, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 圆形玩家
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与边界碰撞，允许移出
  
  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 控制
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  
  // 显示状态信息
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#00FFFF',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Use Arrow Keys or WASD to move. Player wraps around edges.', {
    fontSize: '14px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 处理输入
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }
  
  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }
  
  // 实现边界循环效果
  const padding = 16; // 玩家半径
  
  // 左右边界循环
  if (player.x < -padding) {
    player.x = config.width + padding;
    wrapCount++;
  } else if (player.x > config.width + padding) {
    player.x = -padding;
    wrapCount++;
  }
  
  // 上下边界循环
  if (player.y < -padding) {
    player.y = config.height + padding;
    wrapCount++;
  } else if (player.y > config.height + padding) {
    player.y = -padding;
    wrapCount++;
  }
  
  // 更新状态信号
  playerX = Math.round(player.x);
  playerY = Math.round(player.y);
  
  // 显示状态信息
  statusText.setText([
    `Position: (${playerX}, ${playerY})`,
    `Speed: ${PLAYER_SPEED}`,
    `Wrap Count: ${wrapCount}`,
    `Velocity: (${Math.round(player.body.velocity.x)}, ${Math.round(player.body.velocity.y)})`
  ]);
}

// 创建游戏实例
const game = new Phaser.Game(config);