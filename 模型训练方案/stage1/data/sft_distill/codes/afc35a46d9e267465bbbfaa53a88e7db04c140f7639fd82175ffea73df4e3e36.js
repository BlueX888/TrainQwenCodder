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

// 状态信号
let gameState = {
  enemiesKilled: 0,
  particleExplosions: 0,
  lastExplosionTime: 0
};

let player;
let enemy;
let cursors;
let particleEmitter;
let infoText;

function preload() {
  // 创建玩家纹理（白色方块）
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0xffffff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();

  // 创建粒子纹理（青色小圆点）
  const particleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  particleGraphics.fillStyle(0x00ffff, 1);
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 500, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人
  enemy = this.physics.add.sprite(400, 100, 'enemy');
  enemy.setCollideWorldBounds(true);
  enemy.setBounce(1);
  enemy.setVelocity(100, 100);

  // 创建粒子发射器
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 300 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 4000, // 4秒生命周期
    gravityY: 0,
    quantity: 20, // 每次爆炸发射20个粒子
    frequency: -1, // 手动触发，不自动发射
    blendMode: 'ADD'
  });

  // 停止自动发射
  particleEmitter.stop();

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, killEnemy, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 信息文本
  infoText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  updateInfoText();

  // 添加提示文本
  this.add.text(400, 550, 'Use Arrow Keys to move and touch the cyan enemy', {
    fontSize: '16px',
    fill: '#aaaaaa'
  }).setOrigin(0.5);
}

function update() {
  // 玩家移动控制
  const speed = 200;
  
  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  } else {
    player.setVelocityX(0);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  } else {
    player.setVelocityY(0);
  }
}

function killEnemy(player, enemy) {
  // 记录爆炸位置
  const explosionX = enemy.x;
  const explosionY = enemy.y;

  // 更新状态信号
  gameState.enemiesKilled++;
  gameState.particleExplosions++;
  gameState.lastExplosionTime = Date.now();

  // 触发粒子爆炸效果
  particleEmitter.setPosition(explosionX, explosionY);
  particleEmitter.explode(20); // 一次性发射20个粒子

  // 移除敌人
  enemy.destroy();

  // 更新信息显示
  updateInfoText();

  // 2秒后重新生成敌人
  this.time.delayedCall(2000, () => {
    respawnEnemy(this);
  });
}

function respawnEnemy(scene) {
  // 随机位置重新生成敌人
  const x = Phaser.Math.Between(100, 700);
  const y = Phaser.Math.Between(100, 300);
  
  enemy = scene.physics.add.sprite(x, y, 'enemy');
  enemy.setCollideWorldBounds(true);
  enemy.setBounce(1);
  enemy.setVelocity(
    Phaser.Math.Between(-150, 150),
    Phaser.Math.Between(50, 150)
  );

  // 重新设置碰撞
  scene.physics.add.overlap(player, enemy, killEnemy, null, scene);
}

function updateInfoText() {
  infoText.setText([
    `Enemies Killed: ${gameState.enemiesKilled}`,
    `Particle Explosions: ${gameState.particleExplosions}`,
    `Last Explosion: ${gameState.lastExplosionTime > 0 ? new Date(gameState.lastExplosionTime).toLocaleTimeString() : 'None'}`
  ]);
}

// 启动游戏
new Phaser.Game(config);