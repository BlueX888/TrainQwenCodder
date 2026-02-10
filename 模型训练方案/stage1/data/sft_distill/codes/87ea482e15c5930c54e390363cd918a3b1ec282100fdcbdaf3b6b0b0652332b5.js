const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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

// 游戏状态变量
let player;
let enemies;
let bullets;
let cursors;
let waveNumber = 1;
let enemiesPerWave = 8;
let enemySpeed = 120;
let isWaveActive = false;
let waveText;
let statusText;
let enemyCountText;
let nextWaveTimer = null;
let gameOver = false;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（红色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff0000, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0000ff, 1);
  enemyGraphics.fillCircle(15, 15, 15);
  enemyGraphics.generateTexture('enemy', 30, 30);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色小圆）
  const bulletGraphics = this.add.graphics();
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillCircle(5, 5, 5);
  bulletGraphics.generateTexture('bullet', 10, 10);
  bulletGraphics.destroy();

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

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 鼠标点击射击
  this.input.on('pointerdown', (pointer) => {
    if (!gameOver) {
      shootBullet.call(this);
    }
  });

  // 碰撞检测：子弹击中敌人
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 碰撞检测：敌人触底
  this.physics.add.overlap(player, enemies, enemyReachBottom, null, this);

  // UI文本
  waveText = this.add.text(16, 16, 'Wave: 1', {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  enemyCountText = this.add.text(16, 48, 'Enemies: 0/8', {
    fontSize: '20px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  });

  statusText = this.add.text(400, 300, '', {
    fontSize: '32px',
    fill: '#00ff00',
    fontFamily: 'Arial'
  }).setOrigin(0.5);

  // 开始第一波
  startWave.call(this);
}

function update() {
  if (gameOver) {
    return;
  }

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

  // 清理超出边界的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.y < -10) {
      bullet.destroy();
    }
  });

  // 清理超出边界的敌人（触底）
  enemies.children.entries.forEach(enemy => {
    if (enemy.y > 610) {
      endGame.call(this, 'Enemy Reached Bottom! Game Over!');
    }
  });

  // 检查波次完成
  if (isWaveActive && enemies.countActive(true) === 0) {
    isWaveActive = false;
    prepareNextWave.call(this);
  }

  // 更新敌人数量显示
  enemyCountText.setText(`Enemies: ${enemies.countActive(true)}/${enemiesPerWave}`);
}

function startWave() {
  isWaveActive = true;
  waveText.setText(`Wave: ${waveNumber}`);
  statusText.setText('');

  // 生成敌人
  for (let i = 0; i < enemiesPerWave; i++) {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(-200, -50);
    const enemy = enemies.create(x, y, 'enemy');
    enemy.setVelocityY(enemySpeed);
  }
}

function prepareNextWave() {
  statusText.setText('Wave Complete! Next wave in 2s...');
  
  // 清除之前的计时器
  if (nextWaveTimer) {
    nextWaveTimer.destroy();
  }

  // 2秒后开始下一波
  nextWaveTimer = this.time.addEvent({
    delay: 2000,
    callback: () => {
      waveNumber++;
      startWave.call(this);
    },
    callbackScope: this
  });
}

function shootBullet() {
  const bullet = bullets.get(player.x, player.y - 20);
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.setVelocityY(-400);
  }
}

function hitEnemy(bullet, enemy) {
  bullet.destroy();
  enemy.destroy();
}

function enemyReachBottom(player, enemy) {
  endGame.call(this, 'Enemy Reached Bottom! Game Over!');
}

function endGame(message) {
  if (gameOver) return;
  
  gameOver = true;
  
  // 停止所有敌人
  enemies.children.entries.forEach(enemy => {
    enemy.setVelocity(0, 0);
  });

  // 清除计时器
  if (nextWaveTimer) {
    nextWaveTimer.destroy();
  }

  statusText.setText(message);
  statusText.setStyle({ fill: '#ff0000' });

  // 显示最终波次
  const finalText = this.add.text(400, 350, `Reached Wave: ${waveNumber}`, {
    fontSize: '24px',
    fill: '#ffffff',
    fontFamily: 'Arial'
  }).setOrigin(0.5);
}

const game = new Phaser.Game(config);