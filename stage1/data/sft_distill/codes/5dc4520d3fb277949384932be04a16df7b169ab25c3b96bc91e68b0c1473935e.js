const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 游戏状态变量
let player;
let platforms;
let cursors;
let gameState = {
  platformsReached: 0,
  jumps: 0,
  isGameWon: false,
  currentPlatform: 0
};

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff0000, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x00aa00, 1);
  platformGraphics.fillRect(0, 0, 120, 20);
  platformGraphics.generateTexture('platform', 120, 20);
  platformGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 创建平台组
  platforms = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

  // 平台配置数据（固定种子确保确定性）
  const platformConfigs = [
    { x: 100, y: 550, moveX: 0, moveY: 0, rangeX: 0, rangeY: 0 }, // 起始平台
    { x: 250, y: 480, moveX: 80, moveY: 0, rangeX: 100, rangeY: 0 },
    { x: 400, y: 420, moveX: 0, moveY: 80, rangeX: 0, rangeY: 80 },
    { x: 550, y: 380, moveX: -80, moveY: 0, rangeX: 120, rangeY: 0 },
    { x: 650, y: 320, moveX: 0, moveY: 80, rangeX: 0, rangeY: 100 },
    { x: 500, y: 260, moveX: 80, moveY: 0, rangeX: 150, rangeY: 0 },
    { x: 300, y: 220, moveX: 0, moveY: -80, rangeX: 0, rangeY: 80 },
    { x: 450, y: 180, moveX: 80, moveY: 0, rangeX: 100, rangeY: 0 },
    { x: 600, y: 140, moveX: -80, moveY: 0, rangeX: 120, rangeY: 0 },
    { x: 400, y: 80, moveX: 0, moveY: 0, rangeX: 0, rangeY: 0 } // 终点平台
  ];

  // 创建10个平台
  platformConfigs.forEach((config, index) => {
    const platform = platforms.create(config.x, config.y, 'platform');
    platform.body.setSize(120, 20);
    
    // 存储平台的移动数据
    platform.setData('startX', config.x);
    platform.setData('startY', config.y);
    platform.setData('moveX', config.moveX);
    platform.setData('moveY', config.moveY);
    platform.setData('rangeX', config.rangeX);
    platform.setData('rangeY', config.rangeY);
    platform.setData('direction', 1);
    platform.setData('index', index);
  });

  // 添加碰撞检测
  this.physics.add.collider(player, platforms, onPlatformCollision, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  this.input.keyboard.on('keydown-SPACE', jump, this);

  // 显示状态文本
  this.statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  // 显示控制提示
  this.add.text(16, 560, 'Controls: Arrow Keys to move, SPACE to jump', {
    fontSize: '14px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 5, y: 3 }
  });

  updateStatusText.call(this);
}

function update(time, delta) {
  // 玩家移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 更新平台移动
  platforms.children.entries.forEach(platform => {
    const moveX = platform.getData('moveX');
    const moveY = platform.getData('moveY');
    const rangeX = platform.getData('rangeX');
    const rangeY = platform.getData('rangeY');
    const startX = platform.getData('startX');
    const startY = platform.getData('startY');
    let direction = platform.getData('direction');

    // 水平移动
    if (moveX !== 0) {
      platform.x += moveX * direction * (delta / 1000);
      
      if (direction === 1 && platform.x >= startX + rangeX) {
        platform.x = startX + rangeX;
        platform.setData('direction', -1);
      } else if (direction === -1 && platform.x <= startX - rangeX) {
        platform.x = startX - rangeX;
        platform.setData('direction', 1);
      }
    }

    // 垂直移动
    if (moveY !== 0) {
      platform.y += moveY * direction * (delta / 1000);
      
      if (direction === 1 && platform.y >= startY + rangeY) {
        platform.y = startY + rangeY;
        platform.setData('direction', -1);
      } else if (direction === -1 && platform.y <= startY - rangeY) {
        platform.y = startY - rangeY;
        platform.setData('direction', 1);
      }
    }
  });

  // 检查玩家是否掉落
  if (player.y > 650) {
    resetGame.call(this);
  }

  // 检查胜利条件
  if (!gameState.isGameWon && player.y < 100 && gameState.currentPlatform >= 9) {
    gameState.isGameWon = true;
    updateStatusText.call(this);
    this.add.text(400, 300, 'YOU WIN!', {
      fontSize: '48px',
      fill: '#00ff00',
      backgroundColor: '#000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
  }

  updateStatusText.call(this);
}

function jump() {
  if (player.body.touching.down) {
    player.setVelocityY(-400);
    gameState.jumps++;
  }
}

function onPlatformCollision(player, platform) {
  const platformIndex = platform.getData('index');
  if (platformIndex > gameState.currentPlatform) {
    gameState.currentPlatform = platformIndex;
    gameState.platformsReached = platformIndex + 1;
  }
}

function updateStatusText() {
  this.statusText.setText(
    `Platform: ${gameState.platformsReached}/10 | ` +
    `Jumps: ${gameState.jumps} | ` +
    `Status: ${gameState.isGameWon ? 'WON!' : 'Playing'}`
  );
}

function resetGame() {
  player.setPosition(100, 500);
  player.setVelocity(0, 0);
  gameState.platformsReached = 0;
  gameState.jumps = 0;
  gameState.currentPlatform = 0;
  gameState.isGameWon = false;
}

new Phaser.Game(config);