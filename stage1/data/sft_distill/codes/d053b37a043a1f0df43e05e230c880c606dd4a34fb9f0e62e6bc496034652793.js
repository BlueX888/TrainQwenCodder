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
let crossCount = 0; // 穿越边界次数（验证信号）
let crossText;
let speedText;

const PLAYER_SPEED = 240;

function preload() {
  // 使用 Graphics 创建橙色玩家纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff8800, 1); // 橙色
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许穿越
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 键支持
  this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 显示状态信息
  this.add.text(16, 16, '使用方向键或 WASD 移动橙色方块', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  
  crossText = this.add.text(16, 50, '穿越边界次数: 0', {
    fontSize: '18px',
    fill: '#ffaa00'
  });
  
  speedText = this.add.text(16, 84, '移动速度: 240', {
    fontSize: '18px',
    fill: '#00ff00'
  });
  
  // 绘制边界提示线
  const borderGraphics = this.add.graphics();
  borderGraphics.lineStyle(2, 0x666666, 0.5);
  borderGraphics.strokeRect(0, 0, config.width, config.height);
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 处理键盘输入
  if (cursors.left.isDown || this.aKey.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown || this.dKey.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }
  
  if (cursors.up.isDown || this.wKey.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown || this.sKey.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }
  
  // 循环地图效果 - 边界检测
  const playerWidth = player.width;
  const playerHeight = player.height;
  
  // 左边界穿越到右边
  if (player.x < -playerWidth / 2) {
    player.x = config.width + playerWidth / 2;
    crossCount++;
    updateCrossText();
  }
  
  // 右边界穿越到左边
  if (player.x > config.width + playerWidth / 2) {
    player.x = -playerWidth / 2;
    crossCount++;
    updateCrossText();
  }
  
  // 上边界穿越到下边
  if (player.y < -playerHeight / 2) {
    player.y = config.height + playerHeight / 2;
    crossCount++;
    updateCrossText();
  }
  
  // 下边界穿越到上边
  if (player.y > config.height + playerHeight / 2) {
    player.y = -playerHeight / 2;
    crossCount++;
    updateCrossText();
  }
}

function updateCrossText() {
  crossText.setText('穿越边界次数: ' + crossCount);
}

new Phaser.Game(config);