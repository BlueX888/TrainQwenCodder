const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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
  },
  backgroundColor: '#2d2d2d'
};

// 全局信号对象
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  enemyX: 0,
  enemyY: 0,
  distance: 0,
  gameOver: false,
  survivalTime: 0
};

let player;
let enemy;
let cursors;
let gameOver = false;
let startTime;

function preload() {
  // 创建玩家纹理（蓝色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0088ff, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（橙色方块）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff8800, 1);
  enemyGraphics.fillRect(0, 0, 32, 32);
  enemyGraphics.generateTexture('enemy', 32, 32);
  enemyGraphics.destroy();
}

function create() {
  startTime = this.time.now;

  // 创建玩家精灵（中心位置）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  
  // 创建敌人精灵（左上角）
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 创建键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, hitEnemy, null, this);

  // 添加说明文字
  this.add.text(10, 10, 'Arrow Keys: Move Player (Speed: 144)', {
    fontSize: '16px',
    fill: '#ffffff'
  });

  this.add.text(10, 30, 'Orange Enemy: Chases you (Speed: 120)', {
    fontSize: '16px',
    fill: '#ff8800'
  });

  this.add.text(10, 50, 'Survive as long as possible!', {
    fontSize: '16px',
    fill: '#00ff00'
  });
}

function update(time, delta) {
  if (gameOver) {
    return;
  }

  // 更新存活时间
  window.__signals__.survivalTime = ((time - startTime) / 1000).toFixed(2);

  // 玩家移动控制（速度 120 * 1.2 = 144）
  const playerSpeed = 144;
  player.setVelocity(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-playerSpeed);
  } else if (cursors.right.isDown) {
    player.setVelocityX(playerSpeed);
  }

  if (cursors.up.isDown) {
    player.setVelocityY(-playerSpeed);
  } else if (cursors.down.isDown) {
    player.setVelocityY(playerSpeed);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(playerSpeed);
  }

  // 敌人追踪玩家（速度 120）
  const enemySpeed = 120;
  this.physics.moveToObject(enemy, player, enemySpeed);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新信号
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.playerY = Math.round(player.y);
  window.__signals__.enemyX = Math.round(enemy.x);
  window.__signals__.enemyY = Math.round(enemy.y);
  window.__signals__.distance = Math.round(distance);
  window.__signals__.gameOver = gameOver;

  // 输出日志（每秒一次）
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    console.log(JSON.stringify({
      time: window.__signals__.survivalTime,
      playerPos: { x: window.__signals__.playerX, y: window.__signals__.playerY },
      enemyPos: { x: window.__signals__.enemyX, y: window.__signals__.enemyY },
      distance: window.__signals__.distance,
      gameOver: window.__signals__.gameOver
    }));
  }
}

function hitEnemy() {
  if (gameOver) {
    return;
  }

  gameOver = true;
  window.__signals__.gameOver = true;

  // 停止所有移动
  player.setVelocity(0);
  enemy.setVelocity(0);

  // 显示游戏结束文字
  this.add.text(400, 300, 'GAME OVER!', {
    fontSize: '48px',
    fill: '#ff0000',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  this.add.text(400, 350, `Survived: ${window.__signals__.survivalTime}s`, {
    fontSize: '24px',
    fill: '#ffffff'
  }).setOrigin(0.5);

  // 输出最终日志
  console.log(JSON.stringify({
    event: 'GAME_OVER',
    survivalTime: window.__signals__.survivalTime,
    finalDistance: window.__signals__.distance,
    playerPos: { x: window.__signals__.playerX, y: window.__signals__.playerY },
    enemyPos: { x: window.__signals__.enemyX, y: window.__signals__.enemyY }
  }));
}

new Phaser.Game(config);