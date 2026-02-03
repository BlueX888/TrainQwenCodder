const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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

let player;
let enemy;
let particleEmitter;
let cursors;
let statusText;
let gameState = {
  enemiesDestroyed: 0,
  explosionsTriggered: 0,
  isEnemyAlive: true
};

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建粒子纹理（青色小圆点）
  const particleGraphics = this.add.graphics();
  particleGraphics.fillStyle(0x00ffff, 1);
  particleGraphics.fillCircle(4, 4, 4);
  particleGraphics.generateTexture('particle', 8, 8);
  particleGraphics.destroy();
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(100, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建青色敌人
  enemy = this.physics.add.sprite(600, 300, 'enemy');
  enemy.setCollideWorldBounds(true);
  
  // 给敌人添加简单的移动
  enemy.setVelocity(
    Phaser.Math.Between(-100, 100),
    Phaser.Math.Between(-100, 100)
  );
  enemy.setBounce(1, 1);

  // 创建粒子发射器（初始状态为关闭）
  particleEmitter = this.add.particles(0, 0, 'particle', {
    speed: { min: 100, max: 300 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 4000, // 持续4秒
    gravityY: 0,
    quantity: 20, // 每次发射20个粒子
    frequency: -1, // 不自动发射，手动触发
    blendMode: 'ADD'
  });

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, destroyEnemy, null, this);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();

  // 添加提示文本
  this.add.text(400, 550, '使用方向键移动绿色方块，碰撞青色敌人触发粒子爆炸', {
    fontSize: '16px',
    fill: '#ffff00'
  }).setOrigin(0.5);
}

function update() {
  if (!player) return;

  // 玩家移动控制
  const speed = 200;
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(speed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(speed);
  }
}

function destroyEnemy(player, enemy) {
  if (!gameState.isEnemyAlive) return;

  // 标记敌人已被摧毁
  gameState.isEnemyAlive = false;
  gameState.enemiesDestroyed++;
  gameState.explosionsTriggered++;

  // 获取敌人位置
  const enemyX = enemy.x;
  const enemyY = enemy.y;

  // 销毁敌人精灵
  enemy.destroy();

  // 在敌人位置触发粒子爆炸
  particleEmitter.setPosition(enemyX, enemyY);
  particleEmitter.explode(20); // 发射20个粒子

  // 更新状态文本
  updateStatusText();

  // 4秒后可以重新生成敌人（可选）
  this.time.delayedCall(4000, () => {
    if (!enemy || !enemy.active) {
      respawnEnemy(this);
    }
  });
}

function respawnEnemy(scene) {
  // 重新生成敌人
  const x = Phaser.Math.Between(400, 700);
  const y = Phaser.Math.Between(100, 500);
  
  enemy = scene.physics.add.sprite(x, y, 'enemy');
  enemy.setCollideWorldBounds(true);
  enemy.setVelocity(
    Phaser.Math.Between(-100, 100),
    Phaser.Math.Between(-100, 100)
  );
  enemy.setBounce(1, 1);

  // 重新添加碰撞检测
  scene.physics.add.overlap(player, enemy, destroyEnemy, null, scene);

  gameState.isEnemyAlive = true;
  updateStatusText();
}

function updateStatusText() {
  statusText.setText([
    `敌人状态: ${gameState.isEnemyAlive ? '存活' : '已摧毁'}`,
    `摧毁敌人数: ${gameState.enemiesDestroyed}`,
    `爆炸触发次数: ${gameState.explosionsTriggered}`
  ]);
}

new Phaser.Game(config);