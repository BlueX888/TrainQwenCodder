const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
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

// 状态变量（用于验证）
let gameState = {
  platformBounces: 0,  // 平台反弹次数
  playerX: 0,          // 玩家X坐标
  playerY: 0,          // 玩家Y坐标
  platformDirection: 1 // 平台移动方向 (1: 右, -1: 左)
};

let player;
let platform;
let cursors;
let ground;

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

  // 创建移动平台纹理（绿色矩形）
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00ff00, 1);
  platformGraphics.fillRect(0, 0, 150, 20);
  platformGraphics.generateTexture('platform', 150, 20);
  platformGraphics.destroy();

  // 创建地面纹理（灰色）
  const groundGraphics = this.add.graphics();
  groundGraphics.fillStyle(0x808080, 1);
  groundGraphics.fillRect(0, 0, 800, 40);
  groundGraphics.generateTexture('ground', 800, 40);
  groundGraphics.destroy();

  // 创建地面
  ground = this.physics.add.sprite(400, 580, 'ground');
  ground.setImmovable(true);
  ground.body.allowGravity = false;

  // 创建移动平台
  platform = this.physics.add.sprite(200, 300, 'platform');
  platform.setImmovable(true);
  platform.body.allowGravity = false;
  platform.setVelocityX(200); // 初始速度向右200
  
  // 设置平台边界
  platform.minX = 100;
  platform.maxX = 700;

  // 创建玩家
  player = this.physics.add.sprite(400, 200, 'player');
  player.setBounce(0);
  player.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.collider(player, ground);
  this.physics.add.collider(player, platform);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加状态显示文本
  this.statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 初始化状态
  gameState.platformDirection = 1;
  gameState.platformBounces = 0;
}

function update() {
  // 更新玩家位置状态
  gameState.playerX = Math.round(player.x);
  gameState.playerY = Math.round(player.y);

  // 移动平台逻辑：检测边界并反转方向
  if (platform.x <= platform.minX && platform.body.velocity.x < 0) {
    platform.setVelocityX(200);
    gameState.platformDirection = 1;
    gameState.platformBounces++;
  } else if (platform.x >= platform.maxX && platform.body.velocity.x > 0) {
    platform.setVelocityX(-200);
    gameState.platformDirection = -1;
    gameState.platformBounces++;
  }

  // 玩家控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃（只能在地面或平台上跳跃）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-350);
  }

  // 更新状态显示
  this.statusText.setText([
    `Platform Bounces: ${gameState.platformBounces}`,
    `Player Pos: (${gameState.playerX}, ${gameState.playerY})`,
    `Platform Dir: ${gameState.platformDirection === 1 ? 'RIGHT' : 'LEFT'}`,
    `Platform Pos: ${Math.round(platform.x)}`,
    `On Platform: ${player.body.touching.down && platform.body.touching.up ? 'YES' : 'NO'}`,
    '',
    'Controls: Arrow Keys to move, UP to jump'
  ].join('\n'));
}

// 创建游戏实例
const game = new Phaser.Game(config);