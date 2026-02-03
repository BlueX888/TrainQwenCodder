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

// 游戏状态变量（可验证）
let gameState = {
  currentWave: 1,
  enemiesInWave: 8,
  enemiesKilled: 0,
  totalKilled: 0,
  isWaveActive: false,
  isWaitingForNextWave: false
};

let player;
let enemies;
let bullets;
let cursors;
let fireKey;
let waveText;
let statsText;
let nextWaveTimer;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00aaff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x888888, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色小圆）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 20
  });

  // 输入控制
  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // UI 文本
  waveText = this.add.text(400, 50, 'Wave: 1', {
    fontSize: '32px',
    fill: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  statsText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  // 开始第一波
  startWave.call(this);
}

function update(time, delta) {
  // 玩家移动
  if (cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-300);
  } else if (cursors.down.isDown) {
    player.setVelocityY(300);
  } else {
    player.setVelocityY(0);
  }

  // 发射子弹
  if (Phaser.Input.Keyboard.JustDown(fireKey)) {
    fireBullet.call(this);
  }

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < 0) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 更新统计信息
  updateStats();
}

function startWave() {
  gameState.isWaveActive = true;
  gameState.isWaitingForNextWave = false;
  gameState.enemiesKilled = 0;

  // 生成 8 个敌人
  for (let i = 0; i < gameState.enemiesInWave; i++) {
    const x = 100 + i * 80;
    const y = 100;
    
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setVelocity(
      Phaser.Math.Between(-160, 160),
      Phaser.Math.Between(50, 160)
    );
    enemy.setBounce(1);
    enemy.setCollideWorldBounds(true);
    
    // 确保敌人速度为 160
    const speed = 160;
    const angle = Phaser.Math.Between(0, 360);
    enemy.setVelocity(
      Math.cos(angle * Math.PI / 180) * speed,
      Math.sin(angle * Math.PI / 180) * speed
    );
  }

  waveText.setText(`Wave: ${gameState.currentWave}`);
}

function fireBullet() {
  const bullet = bullets.get(player.x, player.y);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-400);
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.setActive(false);
  bullet.setVisible(false);
  enemy.destroy();

  // 更新统计
  gameState.enemiesKilled++;
  gameState.totalKilled++;

  // 检查是否清空当前波次
  if (gameState.enemiesKilled >= gameState.enemiesInWave) {
    onWaveComplete.call(this);
  }
}

function onWaveComplete() {
  gameState.isWaveActive = false;
  gameState.isWaitingForNextWave = true;

  // 显示波次完成信息
  const completeText = this.add.text(400, 300, 'Wave Complete!\nNext wave in 2 seconds...', {
    fontSize: '28px',
    fill: '#00ff00',
    align: 'center',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 2 秒后开始下一波
  nextWaveTimer = this.time.addEvent({
    delay: 2000,
    callback: () => {
      completeText.destroy();
      gameState.currentWave++;
      startWave.call(this);
    },
    callbackScope: this
  });
}

function updateStats() {
  const enemiesRemaining = enemies.countActive(true);
  statsText.setText(
    `Wave: ${gameState.currentWave}\n` +
    `Enemies: ${enemiesRemaining}/${gameState.enemiesInWave}\n` +
    `Killed this wave: ${gameState.enemiesKilled}\n` +
    `Total killed: ${gameState.totalKilled}\n` +
    `Status: ${gameState.isWaitingForNextWave ? 'Waiting...' : 'Active'}`
  );
}

// 启动游戏
new Phaser.Game(config);