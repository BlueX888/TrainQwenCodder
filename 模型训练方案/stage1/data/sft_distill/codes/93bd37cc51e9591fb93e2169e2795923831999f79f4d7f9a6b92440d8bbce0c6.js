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

// 游戏状态变量（可验证的状态信号）
let gameState = {
  currentWave: 1,
  enemiesKilled: 0,
  totalEnemiesSpawned: 0,
  isWaveActive: false,
  waveTransitioning: false
};

let player;
let enemies;
let bullets;
let cursors;
let waveText;
let statsText;
let shootKey;
let lastShootTime = 0;
let shootCooldown = 300; // 射击冷却时间（毫秒）

const ENEMY_SPEED = 80;
const ENEMIES_PER_WAVE = 3;
const WAVE_DELAY = 2000; // 2秒延迟

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0x0000ff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建子弹纹理（黄色小方块）
  const bulletGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  bulletGraphics.fillStyle(0xffff00, 1);
  bulletGraphics.fillRect(0, 0, 8, 8);
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

  // 设置碰撞检测：子弹击中敌人
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);

  // 键盘输入
  cursors = this.input.keyboard.createCursorKeys();
  shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // 显示波次信息
  waveText = this.add.text(400, 50, 'Wave: 1', {
    fontSize: '32px',
    fill: '#ffffff',
    fontStyle: 'bold'
  });
  waveText.setOrigin(0.5);

  // 显示统计信息
  statsText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });

  // 开始第一波
  startWave.call(this);
}

function update(time, delta) {
  // 更新统计信息
  statsText.setText([
    `Wave: ${gameState.currentWave}`,
    `Enemies Alive: ${enemies.countActive(true)}`,
    `Enemies Killed: ${gameState.enemiesKilled}`,
    `Wave Active: ${gameState.isWaveActive}`,
    `Transitioning: ${gameState.waveTransitioning}`
  ]);

  // 玩家移动
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-200);
  } else if (cursors.down.isDown) {
    player.setVelocityY(200);
  }

  // 射击
  if (shootKey.isDown && time > lastShootTime + shootCooldown) {
    shoot.call(this);
    lastShootTime = time;
  }

  // 清理超出屏幕的子弹
  bullets.children.entries.forEach(bullet => {
    if (bullet.active && bullet.y < 0) {
      bullet.setActive(false);
      bullet.setVisible(false);
    }
  });

  // 检查当前波次是否完成
  if (gameState.isWaveActive && !gameState.waveTransitioning) {
    if (enemies.countActive(true) === 0) {
      onWaveComplete.call(this);
    }
  }
}

function shoot() {
  // 从子弹池获取子弹
  const bullet = bullets.get(player.x, player.y - 20);
  
  if (bullet) {
    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.velocity.y = -400;
  }
}

function hitEnemy(bullet, enemy) {
  // 销毁子弹和敌人
  bullet.setActive(false);
  bullet.setVisible(false);
  bullet.body.velocity.y = 0;
  
  enemy.destroy();
  
  // 更新击杀计数
  gameState.enemiesKilled++;
}

function startWave() {
  gameState.isWaveActive = true;
  gameState.waveTransitioning = false;

  // 更新波次文本
  waveText.setText(`Wave: ${gameState.currentWave}`);

  // 生成敌人
  for (let i = 0; i < ENEMIES_PER_WAVE; i++) {
    spawnEnemy.call(this, i);
  }

  gameState.totalEnemiesSpawned += ENEMIES_PER_WAVE;
}

function spawnEnemy(index) {
  // 在屏幕顶部随机位置生成敌人
  const x = 100 + index * 250;
  const y = 50;

  const enemy = enemies.create(x, y, 'enemy');
  enemy.setVelocity(
    Phaser.Math.Between(-ENEMY_SPEED, ENEMY_SPEED),
    Phaser.Math.Between(ENEMY_SPEED * 0.5, ENEMY_SPEED)
  );
  enemy.setBounce(1);
  enemy.setCollideWorldBounds(true);
}

function onWaveComplete() {
  gameState.waveTransitioning = true;
  gameState.isWaveActive = false;

  // 显示波次完成信息
  const completeText = this.add.text(400, 300, 'Wave Complete!', {
    fontSize: '48px',
    fill: '#00ff00',
    fontStyle: 'bold'
  });
  completeText.setOrigin(0.5);

  // 2秒后开始下一波
  this.time.addEvent({
    delay: WAVE_DELAY,
    callback: () => {
      completeText.destroy();
      gameState.currentWave++;
      startWave.call(this);
    },
    callbackScope: this
  });
}

const game = new Phaser.Game(config);