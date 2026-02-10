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
let boundaryText;
let crossCount = 0; // 状态信号：记录穿越边界次数

const PLAYER_SPEED = 80;

function preload() {
  // 使用 Graphics 创建青色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(16, 16, 16); // 半径 16 的圆形
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵（初始位置在屏幕中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 键支持
  this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 显示状态信息
  this.add.text(16, 16, '使用方向键或 WASD 移动', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  
  boundaryText = this.add.text(16, 50, '穿越边界次数: 0', {
    fontSize: '18px',
    fill: '#00ffff'
  });
  
  // 显示玩家位置（用于调试验证）
  this.positionText = this.add.text(16, 84, '', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
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
  
  // 循环地图效果：检测边界并从对侧出现
  const playerRadius = 16; // 玩家半径
  
  // 左边界 → 右边界
  if (player.x < -playerRadius) {
    player.x = config.width + playerRadius;
    crossCount++;
    updateBoundaryText();
  }
  
  // 右边界 → 左边界
  if (player.x > config.width + playerRadius) {
    player.x = -playerRadius;
    crossCount++;
    updateBoundaryText();
  }
  
  // 上边界 → 下边界
  if (player.y < -playerRadius) {
    player.y = config.height + playerRadius;
    crossCount++;
    updateBoundaryText();
  }
  
  // 下边界 → 上边界
  if (player.y > config.height + playerRadius) {
    player.y = -playerRadius;
    crossCount++;
    updateBoundaryText();
  }
  
  // 更新位置显示
  this.positionText.setText(`位置: (${Math.round(player.x)}, ${Math.round(player.y)})`);
}

function updateBoundaryText() {
  boundaryText.setText(`穿越边界次数: ${crossCount}`);
}

new Phaser.Game(config);