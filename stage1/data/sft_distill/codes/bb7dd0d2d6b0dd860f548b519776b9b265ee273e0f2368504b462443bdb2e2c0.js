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

// 游戏状态变量（可验证状态）
let gameState = {
  currentWave: 1,
  enemiesPerWave: 8,
  enemiesKilled: 0,
  totalEnemiesKilled: 0,
  isWaveActive: false,
  waveTransitionDelay: 2000 // 2秒延迟
};

let player;
let enemies;
let waveText;
let statsText;
let nextWaveTimer;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0066ff, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 设置碰撞检测
  this.physics.add.overlap(player, enemies, hitEnemy, null, this);

  // 创建UI文本
  waveText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  statsText = this.add.text(16, 50, '', {
    fontSize: '18px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  // 键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 开始第一波
  startWave.call(this);

  // 更新UI
  updateUI();
}

function update() {
  // 玩家移动控制
  if (this.cursors.left.isDown) {
    player.setVelocityX(-300);
  } else if (this.cursors.right.isDown) {
    player.setVelocityX(300);
  } else {
    player.setVelocityX(0);
  }

  if (this.cursors.up.isDown) {
    player.setVelocityY(-300);
  } else if (this.cursors.down.isDown) {
    player.setVelocityY(300);
  } else {
    player.setVelocityY(0);
  }

  // 检查敌人是否超出屏幕底部
  enemies.children.entries.forEach(enemy => {
    if (enemy.y > 650) {
      enemy.destroy();
      checkWaveComplete.call(this);
    }
  });
}

function startWave() {
  gameState.isWaveActive = true;
  gameState.enemiesKilled = 0;

  // 生成8个敌人
  for (let i = 0; i < gameState.enemiesPerWave; i++) {
    // 使用固定随机种子确保可重现性
    const seed = gameState.currentWave * 1000 + i;
    const x = ((seed * 9301 + 49297) % 233280) / 233280 * 700 + 50;
    const delay = i * 300; // 每个敌人间隔300ms生成

    this.time.delayedCall(delay, () => {
      spawnEnemy.call(this, x);
    });
  }

  updateUI();
}

function spawnEnemy(x) {
  const enemy = enemies.create(x, -30, 'enemy');
  enemy.setVelocityY(120); // 敌人速度120
  enemy.body.setCircle(15); // 设置圆形碰撞体
}

function hitEnemy(player, enemy) {
  // 敌人被消灭
  enemy.destroy();
  gameState.enemiesKilled++;
  gameState.totalEnemiesKilled++;

  updateUI();
  checkWaveComplete.call(this);
}

function checkWaveComplete() {
  // 检查当前波次是否完成
  if (gameState.isWaveActive && enemies.countActive(true) === 0) {
    gameState.isWaveActive = false;

    // 清除之前的计时器（如果存在）
    if (nextWaveTimer) {
      nextWaveTimer.remove();
    }

    // 2秒后开始下一波
    nextWaveTimer = this.time.delayedCall(gameState.waveTransitionDelay, () => {
      gameState.currentWave++;
      startWave.call(this);
    });

    updateUI();
  }
}

function updateUI() {
  const activeEnemies = enemies.countActive(true);
  const waveStatus = gameState.isWaveActive ? 'Active' : 'Next wave in 2s...';

  waveText.setText(`Wave: ${gameState.currentWave} [${waveStatus}]`);
  statsText.setText(
    `Enemies Remaining: ${activeEnemies}\n` +
    `Wave Killed: ${gameState.enemiesKilled}/${gameState.enemiesPerWave}\n` +
    `Total Killed: ${gameState.totalEnemiesKilled}`
  );
}

// 启动游戏
new Phaser.Game(config);