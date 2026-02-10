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
let playerState = {
  x: 0,
  y: 0,
  wrapCount: 0 // 记录穿越边界的次数作为可验证状态
};

function preload() {
  // 使用 Graphics 创建蓝色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0000ff, 1);
  graphics.fillRect(0, 0, 32, 32);
  graphics.generateTexture('player', 32, 32);
  graphics.destroy();
}

function create() {
  // 创建玩家精灵（蓝色方块）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
  
  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();
  
  // 添加 WASD 键支持
  this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 显示状态信息
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

function update() {
  // 重置速度
  player.setVelocity(0);
  
  // 键盘控制（方向键或WASD）
  if (cursors.left.isDown || this.aKey.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown || this.dKey.isDown) {
    player.setVelocityX(200);
  }
  
  if (cursors.up.isDown || this.wKey.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown || this.sKey.isDown) {
    player.setVelocityY(200);
  }
  
  // 处理边界循环效果
  const padding = 16; // 玩家半径
  
  // 左边界穿越到右边
  if (player.x < -padding) {
    player.x = config.width + padding;
    playerState.wrapCount++;
  }
  // 右边界穿越到左边
  else if (player.x > config.width + padding) {
    player.x = -padding;
    playerState.wrapCount++;
  }
  
  // 上边界穿越到下边
  if (player.y < -padding) {
    player.y = config.height + padding;
    playerState.wrapCount++;
  }
  // 下边界穿越到上边
  else if (player.y > config.height + padding) {
    player.y = -padding;
    playerState.wrapCount++;
  }
  
  // 更新状态信息
  playerState.x = Math.round(player.x);
  playerState.y = Math.round(player.y);
  
  // 显示状态
  this.statusText.setText([
    `Position: (${playerState.x}, ${playerState.y})`,
    `Wrap Count: ${playerState.wrapCount}`,
    `Speed: 200`,
    `Controls: Arrow Keys or WASD`
  ]);
}

// 创建游戏实例
const game = new Phaser.Game(config);