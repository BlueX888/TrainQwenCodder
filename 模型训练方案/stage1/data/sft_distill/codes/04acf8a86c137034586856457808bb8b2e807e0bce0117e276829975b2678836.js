// 完整的 Phaser3 橙色敌人追踪游戏
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

// 全局状态信号
window.__signals__ = {
  playerSpeed: 144,
  enemySpeed: 120,
  playerPosition: { x: 0, y: 0 },
  enemyPosition: { x: 0, y: 0 },
  distance: 0,
  collisionCount: 0,
  gameTime: 0,
  escaped: false
};

let player;
let enemy;
let cursors;
let gameTime = 0;

function preload() {
  // 使用 Graphics 创建纹理，无需外部资源
}

function create() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（橙色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff8800, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵（起始位置：屏幕中心）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(144, 144);

  // 创建敌人精灵（起始位置：左上角）
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 创建键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, onCollision, null, this);

  // 添加提示文本
  const infoText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  infoText.setScrollFactor(0);
  infoText.setDepth(100);

  // 更新信息文本
  this.events.on('update', () => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      enemy.x, enemy.y
    );
    
    infoText.setText([
      `Player Speed: ${window.__signals__.playerSpeed}`,
      `Enemy Speed: ${window.__signals__.enemySpeed}`,
      `Distance: ${distance.toFixed(1)}`,
      `Collisions: ${window.__signals__.collisionCount}`,
      `Time: ${(gameTime / 1000).toFixed(1)}s`,
      `Status: ${window.__signals__.escaped ? 'ESCAPED!' : 'RUNNING'}`,
      '',
      'Use Arrow Keys to Move'
    ]);
  });

  // 输出初始化日志
  console.log(JSON.stringify({
    event: 'game_initialized',
    playerSpeed: 144,
    enemySpeed: 120,
    timestamp: Date.now()
  }));
}

function update(time, delta) {
  gameTime = time;
  window.__signals__.gameTime = time;

  // 重置玩家速度
  player.setVelocity(0, 0);

  // 键盘控制玩家移动
  const speed = 144; // 玩家速度：120 * 1.2 = 144
  
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

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    const angle = Math.atan2(player.body.velocity.y, player.body.velocity.x);
    player.setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed
    );
  }

  // 敌人追踪玩家
  const enemySpeed = 120;
  this.physics.moveToObject(enemy, player, enemySpeed);

  // 更新状态信号
  window.__signals__.playerPosition = { x: player.x, y: player.y };
  window.__signals__.enemyPosition = { x: enemy.x, y: enemy.y };
  window.__signals__.distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 检查是否成功逃脱（保持距离超过10秒）
  if (window.__signals__.distance > 200 && time > 10000) {
    window.__signals__.escaped = true;
  }
}

function onCollision(player, enemy) {
  // 碰撞发生
  window.__signals__.collisionCount++;

  // 输出碰撞日志
  console.log(JSON.stringify({
    event: 'collision',
    collisionCount: window.__signals__.collisionCount,
    playerPosition: window.__signals__.playerPosition,
    enemyPosition: window.__signals__.enemyPosition,
    timestamp: Date.now()
  }));

  // 碰撞后短暂击退效果
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );
  
  player.setVelocity(
    Math.cos(angle) * 200,
    Math.sin(angle) * 200
  );

  // 敌人短暂停顿
  enemy.setVelocity(0, 0);
  
  // 0.5秒后恢复敌人追踪
  setTimeout(() => {
    if (enemy && enemy.body) {
      enemy.body.enable = true;
    }
  }, 500);
}

// 启动游戏
const game = new Phaser.Game(config);

// 每秒输出状态日志
setInterval(() => {
  if (window.__signals__) {
    console.log(JSON.stringify({
      event: 'status_update',
      signals: window.__signals__,
      timestamp: Date.now()
    }));
  }
}, 1000);