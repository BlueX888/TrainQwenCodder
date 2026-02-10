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
  enemiesRemaining: 0,
  totalEnemiesKilled: 0,
  isWaveActive: false,
  isWaitingForNextWave: false
};

let player;
let enemies;
let bullets;
let cursors;
let fireKey;
let lastFired = 0;
let waveText;
let enemyCountText;
let nextWaveTimer;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建纹理
  createTextures.call(this);
  
  // 创建玩家
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人组
  enemies = this.physics.add.group({
    defaultKey: 'enemy',
    maxSize: 20
  });
  
  // 创建子弹组
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30
  });
  
  // 碰撞检测
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
  
  // 输入控制
  cursors = this.input.keyboard.createCursorKeys();
  fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // UI 文本
  waveText = this.add.text(16, 16, 'Wave: 1', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });
  
  enemyCountText = this.add.text(16, 50, 'Enemies: 0', {
    fontSize: '20px',
    fill: '#ffff00',
    fontFamily: 'Arial'
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
  
  // 射击
  if (fireKey.isDown && time > lastFired) {
    fireBullet.call(this);
    lastFired = time + 200; // 200ms 射击间隔
  }
  
  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < -10) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });
  
  // 清理超出屏幕的敌人
  enemies.children.entries.forEach(enemy => {
    if (enemy.active && enemy.y > 610) {
      enemy.setActive(false);
      enemy.setVisible(false);
      gameState.enemiesRemaining--;
      updateUI();
      checkWaveComplete.call(this);
    }
  });
  
  // 更新 UI
  updateUI();
}

function createTextures() {
  // 玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();
  
  // 敌人纹理（黄色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xffff00, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();
  
  // 子弹纹理（白色小方块）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffffff, 1);
  bulletGraphics.fillRect(0, 0, 6, 12);
  bulletGraphics.generateTexture('bullet', 6, 12);
  bulletGraphics.destroy();
}

function startWave() {
  if (gameState.isWaitingForNextWave) return;
  
  gameState.isWaveActive = true;
  gameState.enemiesRemaining = 15;
  gameState.isWaitingForNextWave = false;
  
  // 生成 15 个敌人
  for (let i = 0; i < 15; i++) {
    // 使用固定随机种子保证确定性
    const x = 50 + (i * 50) % 700;
    const delay = i * 300; // 每个敌人延迟300ms生成
    
    this.time.delayedCall(delay, () => {
      spawnEnemy.call(this, x);
    });
  }
  
  updateUI();
}

function spawnEnemy(x) {
  let enemy = enemies.get(x, -30);
  
  if (enemy) {
    enemy.setActive(true);
    enemy.setVisible(true);
    enemy.setVelocityY(200); // 速度 200
    enemy.body.setSize(30, 30);
  }
}

function fireBullet() {
  let bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-400);
    bullet.body.setSize(6, 12);
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
  
  // 更新状态
  gameState.enemiesRemaining--;
  gameState.totalEnemiesKilled++;
  
  // 检查波次完成
  checkWaveComplete.call(this);
}

function checkWaveComplete() {
  if (gameState.isWaveActive && gameState.enemiesRemaining <= 0 && !gameState.isWaitingForNextWave) {
    gameState.isWaveActive = false;
    gameState.isWaitingForNextWave = true;
    
    // 2秒后进入下一波
    if (nextWaveTimer) {
      nextWaveTimer.remove();
    }
    
    nextWaveTimer = this.time.delayedCall(2000, () => {
      gameState.currentWave++;
      startWave.call(this);
    });
    
    // 显示提示
    const completeText = this.add.text(400, 300, 'Wave Complete!\nNext wave in 2 seconds...', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial',
      align: 'center'
    });
    completeText.setOrigin(0.5);
    
    this.time.delayedCall(2000, () => {
      completeText.destroy();
    });
  }
}

function updateUI() {
  waveText.setText(`Wave: ${gameState.currentWave}`);
  enemyCountText.setText(`Enemies: ${gameState.enemiesRemaining}`);
}

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏状态供验证
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gameState };
}