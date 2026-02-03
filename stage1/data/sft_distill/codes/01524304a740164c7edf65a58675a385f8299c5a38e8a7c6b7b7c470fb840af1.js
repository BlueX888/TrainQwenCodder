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
  currentPlatform: 0,
  platformsReached: 0,
  isGameOver: false,
  isVictory: false,
  score: 0
};
let statusText;
let restartText;

function preload() {
  // 创建玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xFF6B6B, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建平台纹理
  const platformGraphics = this.add.graphics();
  platformGraphics.fillStyle(0x4ECDC4, 1);
  platformGraphics.fillRect(0, 0, 120, 20);
  platformGraphics.lineStyle(2, 0x2C3E50, 1);
  platformGraphics.strokeRect(0, 0, 120, 20);
  platformGraphics.generateTexture('platform', 120, 20);
  platformGraphics.destroy();

  // 创建目标平台纹理
  const goalGraphics = this.add.graphics();
  goalGraphics.fillStyle(0xFFD93D, 1);
  goalGraphics.fillRect(0, 0, 150, 25);
  goalGraphics.lineStyle(3, 0xFF6B35, 1);
  goalGraphics.strokeRect(0, 0, 150, 25);
  goalGraphics.generateTexture('goal', 150, 25);
  goalGraphics.destroy();
}

function create() {
  // 创建平台组
  platforms = this.physics.add.group({
    allowGravity: false,
    immovable: true
  });

  // 平台路径配置（15个平台的位置和移动范围）
  const platformConfigs = [
    { x: 100, y: 550, moveX: 200, moveY: 0 },      // 起始平台
    { x: 250, y: 480, moveX: 0, moveY: 80 },       // 垂直移动
    { x: 400, y: 420, moveX: 150, moveY: 0 },      // 水平移动
    { x: 550, y: 350, moveX: 0, moveY: 100 },      // 垂直移动
    { x: 650, y: 300, moveX: -120, moveY: 0 },     // 反向水平
    { x: 500, y: 250, moveX: 0, moveY: -80 },      // 反向垂直
    { x: 350, y: 200, moveX: 180, moveY: 0 },      // 水平移动
    { x: 200, y: 180, moveX: 0, moveY: 90 },       // 垂直移动
    { x: 100, y: 280, moveX: 150, moveY: 0 },      // 水平移动
    { x: 300, y: 350, moveX: 0, moveY: -100 },     // 垂直移动
    { x: 450, y: 280, moveX: -130, moveY: 0 },     // 反向水平
    { x: 280, y: 220, moveX: 0, moveY: 70 },       // 垂直移动
    { x: 500, y: 180, moveX: 140, moveY: 0 },      // 水平移动
    { x: 680, y: 150, moveX: 0, moveY: 80 },       // 垂直移动
    { x: 700, y: 100, moveX: 0, moveY: 0 }         // 目标平台（静止）
  ];

  // 创建所有平台
  platformConfigs.forEach((config, index) => {
    const isGoal = index === platformConfigs.length - 1;
    const platform = platforms.create(
      config.x, 
      config.y, 
      isGoal ? 'goal' : 'platform'
    );
    
    platform.setData('index', index);
    platform.setData('isGoal', isGoal);
    
    // 如果不是目标平台，添加移动动画
    if (!isGoal && (config.moveX !== 0 || config.moveY !== 0)) {
      const targetX = config.x + config.moveX;
      const targetY = config.y + config.moveY;
      const distance = Math.sqrt(config.moveX ** 2 + config.moveY ** 2);
      const duration = (distance / 240) * 1000; // 速度240像素/秒

      this.tweens.add({
        targets: platform,
        x: targetX,
        y: targetY,
        duration: duration,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
      });
    }
  });

  // 创建玩家
  player = this.physics.add.sprite(100, 500, 'player');
  player.setBounce(0.1);
  player.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.collider(player, platforms, handlePlatformCollision, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 状态文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#000',
    backgroundColor: '#fff',
    padding: { x: 10, y: 5 }
  });

  restartText = this.add.text(400, 300, '', {
    fontSize: '24px',
    fill: '#fff',
    backgroundColor: '#000',
    padding: { x: 20, y: 10 }
  }).setOrigin(0.5).setVisible(false);

  // 重置游戏状态
  gameState = {
    currentPlatform: 0,
    platformsReached: 0,
    isGameOver: false,
    isVictory: false,
    score: 0
  };

  updateStatusText();

  // 添加重启按钮
  this.input.keyboard.on('keydown-R', () => {
    if (gameState.isGameOver || gameState.isVictory) {
      this.scene.restart();
    }
  });
}

function handlePlatformCollision(player, platform) {
  const platformIndex = platform.getData('index');
  const isGoal = platform.getData('isGoal');

  // 只在玩家从上方碰撞时计数
  if (player.body.touching.down && platform.body.touching.up) {
    if (platformIndex > gameState.currentPlatform) {
      gameState.currentPlatform = platformIndex;
      gameState.platformsReached++;
      gameState.score += 100;
      updateStatusText();
    }

    // 检查是否到达目标平台
    if (isGoal && !gameState.isVictory) {
      gameState.isVictory = true;
      handleVictory(this.scene.scene);
    }
  }
}

function updateStatusText() {
  statusText.setText(
    `Platform: ${gameState.platformsReached}/15 | Score: ${gameState.score}`
  );
}

function handleVictory(scene) {
  restartText.setText('VICTORY!\nPress R to Restart');
  restartText.setVisible(true);
  scene.physics.pause();
}

function handleGameOver(scene) {
  if (!gameState.isGameOver) {
    gameState.isGameOver = true;
    restartText.setText('GAME OVER!\nPress R to Restart');
    restartText.setVisible(true);
    scene.physics.pause();
  }
}

function update() {
  if (gameState.isGameOver || gameState.isVictory) {
    return;
  }

  // 检查是否掉落
  if (player.y > 650) {
    handleGameOver(this);
    return;
  }

  // 左右移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  // 跳跃（只能在地面或平台上跳跃）
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
  }

  // 空格键也可以跳跃
  if (this.input.keyboard.checkDown(this.input.keyboard.addKey('SPACE'), 250)) {
    if (player.body.touching.down) {
      player.setVelocityY(-400);
    }
  }
}

new Phaser.Game(config);