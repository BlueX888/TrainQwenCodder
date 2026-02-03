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

// 游戏状态信号
window.__signals__ = {
  playerPosition: { x: 0, y: 0 },
  enemyPosition: { x: 0, y: 0 },
  collisionCount: 0,
  distanceToEnemy: 0,
  gameTime: 0
};

let player;
let enemy;
let cursors;
const PLAYER_SPEED = 240 * 1.2; // 288
const ENEMY_SPEED = 240;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('playerTexture', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemyTexture', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'playerTexture');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵
  enemy = this.physics.add.sprite(100, 100, 'enemyTexture');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 添加提示文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.add.text(10, 30, 'Player Speed: 288 | Enemy Speed: 240', {
    fontSize: '14px',
    fill: '#00ff00'
  });

  this.collisionText = this.add.text(10, 50, 'Collisions: 0', {
    fontSize: '14px',
    fill: '#ff0000'
  });

  console.log('Game initialized:', JSON.stringify({
    playerSpeed: PLAYER_SPEED,
    enemySpeed: ENEMY_SPEED,
    status: 'ready'
  }));
}

function update(time, delta) {
  // 重置玩家速度
  player.setVelocity(0);

  // 玩家移动控制
  if (cursors.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }

  // 对角线移动时标准化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新信号
  window.__signals__.playerPosition = {
    x: Math.round(player.x),
    y: Math.round(player.y)
  };
  window.__signals__.enemyPosition = {
    x: Math.round(enemy.x),
    y: Math.round(enemy.y)
  };
  window.__signals__.distanceToEnemy = Math.round(distance);
  window.__signals__.gameTime = Math.round(time / 1000);
}

function handleCollision(player, enemy) {
  // 碰撞发生
  window.__signals__.collisionCount++;

  // 更新碰撞文本
  this.collisionText.setText('Collisions: ' + window.__signals__.collisionCount);

  // 重置位置
  player.setPosition(400, 300);
  enemy.setPosition(
    Phaser.Math.Between(50, 750),
    Phaser.Math.Between(50, 550)
  );

  // 输出碰撞日志
  console.log('Collision detected:', JSON.stringify({
    collisionCount: window.__signals__.collisionCount,
    playerPosition: window.__signals__.playerPosition,
    enemyPosition: window.__signals__.enemyPosition,
    timestamp: Date.now()
  }));
}

// 启动游戏
new Phaser.Game(config);