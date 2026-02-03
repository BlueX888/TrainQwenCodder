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
  totalEnemiesKilled: 0,
  enemiesPerWave: 20,
  enemySpeed: 120,
  isWaveActive: false,
  isWaitingForNextWave: false
};

let player;
let enemies;
let bullets;
let cursors;
let waveText;
let statusText;
let nextWaveTimer;
let fireKey;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（粉色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色小圆）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(4, 4, 4);
  bulletGraphics.generateTexture('bullet', 8, 8);
  bulletGraphics.destroy();

  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人组
  enemies = this.physics.add.group({
    defaultKey: 'enemy',
    maxSize: 30
  });

  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 50
  });

  // 输入控制
  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 碰撞检测：子弹击中敌人
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 碰撞检测：玩家与敌人
  this.physics.add.overlap(player, enemies, hitPlayer, null, this);

  // UI文本
  waveText = this.add.text(16, 16, '', {
    fontSize: '32px',
    fill: '#fff',
    fontStyle: 'bold'
  });

  statusText = this.add.text(16, 56, '', {
    fontSize: '20px',
    fill: '#fff'
  });

  // 开始第一波
  startWave.call(this);
}

function update(time, delta) {
  // 玩家移动
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  } else {
    player.setVelocityY(0);
  }

  // 发射子弹
  if (Phaser.Input.Keyboard.JustDown(fireKey)) {
    fireBullet.call(this);
  }

  // 更新敌人移动（朝向玩家）
  enemies.getChildren().forEach(enemy => {
    if (enemy.active) {
      this.physics.moveToObject(enemy, player, gameState.enemySpeed);
    }
  });

  // 清理超出边界的子弹
  bullets.getChildren().forEach(bullet => {
    if (bullet.active && (bullet.y < 0 || bullet.y > 600 || bullet.x < 0 || bullet.x > 800)) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 更新UI
  updateUI();

  // 检查波次完成
  if (gameState.isWaveActive && !gameState.isWaitingForNextWave) {
    const activeEnemies = enemies.getChildren().filter(e => e.active).length;
    if (activeEnemies === 0) {
      onWaveComplete.call(this);
    }
  }
}

function startWave() {
  gameState.isWaveActive = true;
  gameState.isWaitingForNextWave = false;
  gameState.enemiesKilled = 0;

  // 生成20个敌人
  for (let i = 0; i < gameState.enemiesPerWave; i++) {
    spawnEnemy.call(this, i);
  }
}

function spawnEnemy(index) {
  // 使用确定性随机位置（基于波次和索引）
  const seed = gameState.currentWave * 1000 + index;
  const x = ((seed * 9301 + 49297) % 233280) / 233280 * 700 + 50;
  const y = ((seed * 1237 + 31337) % 233280) / 233280 * 200 + 50;

  let enemy = enemies.get(x, y);
  
  if (enemy) {
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.setVelocity(0, 0);
  }
}

function fireBullet() {
  let bullet = bullets.get(player.x, player.y - 20);
  
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
  bullet.setVelocity(0, 0);

  enemy.setActive(false);
  enemy.setVisible(false);
  enemy.setVelocity(0, 0);

  // 更新统计
  gameState.enemiesKilled++;
  gameState.totalEnemiesKilled++;
}

function hitPlayer(player, enemy) {
  // 简单处理：敌人消失（可扩展为扣血逻辑）
  enemy.setActive(false);
  enemy.setVisible(false);
  enemy.setVelocity(0, 0);
}

function onWaveComplete() {
  gameState.isWaitingForNextWave = true;
  gameState.isWaveActive = false;

  // 2秒后进入下一波
  if (nextWaveTimer) {
    nextWaveTimer.remove();
  }

  nextWaveTimer = this.time.addEvent({
    delay: 2000,
    callback: () => {
      gameState.currentWave++;
      startWave.call(this);
    },
    callbackScope: this
  });
}

function updateUI() {
  waveText.setText(`Wave: ${gameState.currentWave}`);
  
  const activeEnemies = enemies.getChildren().filter(e => e.active).length;
  let status = `Enemies: ${activeEnemies}/${gameState.enemiesPerWave} | Killed: ${gameState.enemiesKilled} | Total: ${gameState.totalEnemiesKilled}`;
  
  if (gameState.isWaitingForNextWave) {
    status += '\n[Next wave in 2 seconds...]';
  }
  
  statusText.setText(status);
}

// 启动游戏
new Phaser.Game(config);