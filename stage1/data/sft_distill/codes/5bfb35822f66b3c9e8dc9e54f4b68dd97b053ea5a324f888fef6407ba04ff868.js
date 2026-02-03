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
  enemiesKilled: 0,
  totalEnemiesSpawned: 0,
  isWaveActive: false,
  enemiesPerWave: 8,
  enemySpeed: 120
};

let player;
let enemies;
let bullets;
let cursors;
let spaceKey;
let waveText;
let statsText;
let nextWaveTimer;
let lastFired = 0;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0x0088ff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色小方块）
  const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillRect(0, 0, 8, 16);
  bulletGraphics.generateTexture('bullet', 8, 16);
  bulletGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group();

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30
  });

  // 输入设置
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 碰撞检测：子弹击中敌人
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 碰撞检测：玩家碰到敌人（游戏结束）
  this.physics.add.overlap(player, enemies, playerHitEnemy, null, this);

  // UI 文本
  waveText = this.add.text(16, 16, '', {
    fontSize: '24px',
    fill: '#ffffff',
    fontStyle: 'bold'
  });

  statsText = this.add.text(16, 50, '', {
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

  // 发射子弹（限制射速）
  if (spaceKey.isDown && time > lastFired + 200) {
    fireBullet.call(this);
    lastFired = time;
  }

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < -20) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 清理超出屏幕的敌人
  enemies.children.entries.forEach(enemy => {
    if (enemy.active && enemy.y > 620) {
      enemy.destroy();
      checkWaveComplete.call(this);
    }
  });

  // 更新 UI
  updateUI();
}

function startWave() {
  gameState.isWaveActive = true;
  
  // 生成敌人
  for (let i = 0; i < gameState.enemiesPerWave; i++) {
    spawnEnemy.call(this, i);
  }
  
  gameState.totalEnemiesSpawned += gameState.enemiesPerWave;
}

function spawnEnemy(index) {
  // 使用固定种子确保可重现性
  const seed = gameState.currentWave * 1000 + index;
  const pseudoRandom = Math.sin(seed) * 10000;
  const x = 100 + (Math.abs(pseudoRandom) % 600);
  
  const enemy = enemies.create(x, -50, 'enemy');
  enemy.setVelocityY(gameState.enemySpeed);
  
  // 添加轻微的水平移动
  const horizontalSpeed = ((pseudoRandom % 100) - 50);
  enemy.setVelocityX(horizontalSpeed);
  enemy.setBounce(1, 0);
  enemy.setCollideWorldBounds(true);
}

function fireBullet() {
  const bullet = bullets.get(player.x, player.y - 20);
  
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
  
  // 检查波次是否完成
  checkWaveComplete.call(this);
}

function playerHitEnemy(player, enemy) {
  // 游戏结束逻辑（简化处理：显示信息）
  this.physics.pause();
  player.setTint(0xff0000);
  
  const gameOverText = this.add.text(400, 300, 'GAME OVER\nPress R to Restart', {
    fontSize: '32px',
    fill: '#ff0000',
    fontStyle: 'bold',
    align: 'center'
  });
  gameOverText.setOrigin(0.5);
  
  // 重启游戏
  this.input.keyboard.once('keydown-R', () => {
    this.scene.restart();
    resetGameState();
  });
}

function checkWaveComplete() {
  // 检查当前波次的敌人是否全部清除
  const activeEnemies = enemies.countActive(true);
  
  if (activeEnemies === 0 && gameState.isWaveActive) {
    gameState.isWaveActive = false;
    
    // 取消之前的定时器（如果存在）
    if (nextWaveTimer) {
      nextWaveTimer.remove();
    }
    
    // 2秒后开始下一波
    nextWaveTimer = this.time.addEvent({
      delay: 2000,
      callback: () => {
        gameState.currentWave++;
        startWave.call(this);
      },
      callbackScope: this
    });
  }
}

function updateUI() {
  const activeEnemies = enemies.countActive(true);
  
  waveText.setText(`Wave: ${gameState.currentWave}`);
  
  statsText.setText(
    `Enemies Remaining: ${activeEnemies}\n` +
    `Total Killed: ${gameState.enemiesKilled}\n` +
    `Next Wave: ${!gameState.isWaveActive && activeEnemies === 0 ? 'Starting in 2s...' : 'Active'}`
  );
}

function resetGameState() {
  gameState = {
    currentWave: 1,
    enemiesKilled: 0,
    totalEnemiesSpawned: 0,
    isWaveActive: false,
    enemiesPerWave: 8,
    enemySpeed: 120
  };
  lastFired = 0;
  nextWaveTimer = null;
}

const game = new Phaser.Game(config);