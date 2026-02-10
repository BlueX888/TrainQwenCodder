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
  playerPosition: { x: 0, y: 0 },
  enemyPosition: { x: 0, y: 0 },
  distance: 0,
  collisionCount: 0,
  gameTime: 0,
  playerSpeed: 360,
  enemySpeed: 300,
  isPlayerCaught: false
};

let player;
let enemy;
let cursors;
let gameStartTime;

function preload() {
  // 使用 Graphics 生成纹理，无需外部资源
}

function create() {
  gameStartTime = this.time.now;

  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x4444ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（橙色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff8800, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.setMaxVelocity(360, 360); // 玩家速度 300 * 1.2 = 360

  // 创建敌人精灵
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, onCollision, null, this);

  // 添加说明文本
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.add.text(10, 30, 'Blue: Player (Speed 360)', {
    fontSize: '14px',
    fill: '#4444ff'
  });

  this.add.text(10, 50, 'Orange: Enemy (Speed 300)', {
    fontSize: '14px',
    fill: '#ff8800'
  });

  // 显示碰撞计数
  this.collisionText = this.add.text(10, 70, 'Collisions: 0', {
    fontSize: '14px',
    fill: '#ffff00'
  });

  // 显示距离
  this.distanceText = this.add.text(10, 90, 'Distance: 0', {
    fontSize: '14px',
    fill: '#00ff00'
  });
}

function update(time, delta) {
  // 更新游戏时间
  window.__signals__.gameTime = (time - gameStartTime) / 1000;

  // 重置玩家速度
  player.setVelocity(0);

  // 处理玩家输入
  let moving = false;
  if (cursors.left.isDown) {
    player.setVelocityX(-360);
    moving = true;
  } else if (cursors.right.isDown) {
    player.setVelocityX(360);
    moving = true;
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-360);
    moving = true;
  } else if (cursors.down.isDown) {
    player.setVelocityY(360);
    moving = true;
  }

  // 如果对角移动，归一化速度向量
  if (moving && player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    const normalizedSpeed = 360 / Math.sqrt(2);
    player.setVelocity(
      player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
      player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
    );
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, 300);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新状态信号
  window.__signals__.playerPosition = { x: Math.round(player.x), y: Math.round(player.y) };
  window.__signals__.enemyPosition = { x: Math.round(enemy.x), y: Math.round(enemy.y) };
  window.__signals__.distance = Math.round(distance);

  // 更新显示文本
  this.distanceText.setText(`Distance: ${Math.round(distance)}`);

  // 输出状态日志（每秒一次）
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    console.log(JSON.stringify({
      type: 'gameState',
      time: window.__signals__.gameTime.toFixed(2),
      distance: window.__signals__.distance,
      collisions: window.__signals__.collisionCount,
      playerPos: window.__signals__.playerPosition,
      enemyPos: window.__signals__.enemyPosition
    }));
  }
}

function onCollision(player, enemy) {
  // 碰撞发生
  window.__signals__.collisionCount++;
  window.__signals__.isPlayerCaught = true;

  // 更新显示
  this.collisionText.setText(`Collisions: ${window.__signals__.collisionCount}`);

  // 短暂击退效果
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  player.setVelocity(
    Math.cos(angle) * 500,
    Math.sin(angle) * 500
  );

  // 输出碰撞日志
  console.log(JSON.stringify({
    type: 'collision',
    count: window.__signals__.collisionCount,
    time: window.__signals__.gameTime.toFixed(2),
    position: window.__signals__.playerPosition
  }));

  // 重置碰撞状态
  this.time.delayedCall(100, () => {
    window.__signals__.isPlayerCaught = false;
  });
}

const game = new Phaser.Game(config);