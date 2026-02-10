const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态信号变量
let gameState = {
  platformX: 0,
  platformDirection: 1, // 1: 向右, -1: 向左
  playerOnPlatform: false,
  playerX: 0,
  playerY: 0,
  score: 0
};

let player;
let platform;
let cursors;
let ground;
let platformSpeed = 200;
let platformMinX = 100;
let platformMaxX = 600;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();

  // 创建平台纹理（绿色矩形）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 150, 20);
  platformGraphics.generateTexture('platform', 150, 20);
  platformGraphics.destroy();

  // 创建地面纹理（灰色矩形）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x666666, 1);
  groundGraphics.fillRect(0, 0, 800, 32);
  groundGraphics.generateTexture('ground', 800, 32);
  groundGraphics.destroy();

  // 创建地面
  ground = this.physics.add.sprite(400, 584, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(300, 350, 'platform');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.body.setVelocityX(platformSpeed);

  // 创建玩家
  player = this.physics.add.sprite(400, 200, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 设置碰撞
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platform, null, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加说明文字
  this.add.text(16, 16, 'Arrow Keys to Move\nGreen Platform moves back and forth', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  // 添加状态显示
  this.statusText = this.add.text(16, 70, '', {
    fontSize: '14px',
    fill: '#ffff00'
  });
}

function update(time, delta) {
  // 更新平台移动逻辑
  if (platform.x >= platformMaxX) {
    platform.body.setVelocityX(-platformSpeed);
    gameState.platformDirection = -1;
  } else if (platform.x <= platformMinX) {
    platform.body.setVelocityX(platformSpeed);
    gameState.platformDirection = 1;
  }

  // 检测玩家是否在平台上
  const wasOnPlatform = gameState.playerOnPlatform;
  gameState.playerOnPlatform = player.body.touching.down && platform.body.touching.up;

  // 玩家水平移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    // 如果玩家在平台上，跟随平台移动
    if (gameState.playerOnPlatform) {
      player.setVelocityX(platform.body.velocity.x);
    } else {
      player.setVelocityX(0);
    }
  }

  // 跳跃控制
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-350);
  }

  // 更新状态信号
  gameState.platformX = Math.round(platform.x);
  gameState.playerX = Math.round(player.x);
  gameState.playerY = Math.round(player.y);

  // 如果玩家成功站在移动平台上，增加分数
  if (gameState.playerOnPlatform && !wasOnPlatform) {
    gameState.score += 10;
  }

  // 更新状态显示
  this.statusText.setText(
    `Platform X: ${gameState.platformX}\n` +
    `Platform Dir: ${gameState.platformDirection === 1 ? 'RIGHT' : 'LEFT'}\n` +
    `On Platform: ${gameState.playerOnPlatform}\n` +
    `Player Pos: (${gameState.playerX}, ${gameState.playerY})\n` +
    `Score: ${gameState.score}`
  );
}

const game = new Phaser.Game(config);