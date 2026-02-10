const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象用于验证
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  platformX: 0,
  platformY: 0,
  platformVelocity: 0,
  isPlayerOnPlatform: false,
  frameCount: 0,
  platformDirection: 1 // 1: 向右, -1: 向左
};

let player;
let platform;
let cursors;
let platformDirection = 1; // 1表示向右，-1表示向左
const PLATFORM_SPEED = 240;
const PLATFORM_MIN_X = 100;
const PLATFORM_MAX_X = 600;

function preload() {
  // 创建绿色平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 200, 32);
  platformGraphics.generateTexture('platform', 200, 32);
  platformGraphics.destroy();

  // 创建蓝色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 32, 48);
  playerGraphics.generateTexture('player', 32, 48);
  playerGraphics.destroy();
}

function create() {
  // 创建移动平台
  platform = this.physics.add.sprite(300, 450, 'platform');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.setVelocityX(PLATFORM_SPEED * platformDirection);

  // 创建玩家
  player = this.physics.add.sprite(300, 200, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 添加玩家与平台的碰撞检测
  this.physics.add.collider(player, platform, null, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加文本显示信息
  this.infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  console.log('Game initialized - Platform moving at speed:', PLATFORM_SPEED);
}

function update(time, delta) {
  window.__signals__.frameCount++;

  // 检测平台边界，实现往返移动
  if (platform.x <= PLATFORM_MIN_X) {
    platformDirection = 1; // 向右
    platform.setVelocityX(PLATFORM_SPEED * platformDirection);
  } else if (platform.x >= PLATFORM_MAX_X) {
    platformDirection = -1; // 向左
    platform.setVelocityX(PLATFORM_SPEED * platformDirection);
  }

  // 玩家左右移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃控制（只有在地面或平台上才能跳）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-500);
  }

  // 检测玩家是否站在平台上
  const isOnPlatform = player.body.touching.down && 
                       this.physics.overlap(player, platform);

  // 更新信号数据
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.playerY = Math.round(player.y);
  window.__signals__.platformX = Math.round(platform.x);
  window.__signals__.platformY = Math.round(platform.y);
  window.__signals__.platformVelocity = platform.body.velocity.x;
  window.__signals__.isPlayerOnPlatform = isOnPlatform;
  window.__signals__.platformDirection = platformDirection;

  // 更新显示文本
  this.infoText.setText([
    `Frame: ${window.__signals__.frameCount}`,
    `Player: (${window.__signals__.playerX}, ${window.__signals__.playerY})`,
    `Platform: (${window.__signals__.platformX}, ${window.__signals__.platformY})`,
    `Platform Velocity: ${window.__signals__.platformVelocity}`,
    `On Platform: ${window.__signals__.isPlayerOnPlatform}`,
    `Direction: ${platformDirection > 0 ? 'RIGHT' : 'LEFT'}`,
    '',
    'Controls: Arrow Keys to Move, UP to Jump'
  ]);

  // 每100帧输出一次日志用于验证
  if (window.__signals__.frameCount % 100 === 0) {
    console.log(JSON.stringify({
      frame: window.__signals__.frameCount,
      playerPos: { x: window.__signals__.playerX, y: window.__signals__.playerY },
      platformPos: { x: window.__signals__.platformX, y: window.__signals__.platformY },
      platformVel: window.__signals__.platformVelocity,
      onPlatform: window.__signals__.isPlayerOnPlatform
    }));
  }
}

// 启动游戏
new Phaser.Game(config);