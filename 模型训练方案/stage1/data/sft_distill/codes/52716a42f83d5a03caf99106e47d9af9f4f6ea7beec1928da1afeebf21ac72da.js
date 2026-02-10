// 完整的 Phaser3 代码
const config = {
  type: Phaser.HEADLESS,
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
  }
};

// 游戏状态信号
window.__signals__ = {
  playerX: 0,
  playerY: 0,
  enemyX: 0,
  enemyY: 0,
  distance: 0,
  isCaught: false,
  survivalTime: 0
};

let player;
let enemy;
let cursors;
let startTime;

const PLAYER_SPEED = 80 * 1.2; // 96
const ENEMY_SPEED = 80;

function preload() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('player', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（蓝色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x0000ff, 1);
  enemyGraphics.fillCircle(16, 16, 16);
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

  // 设置键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 碰撞检测
  this.physics.add.overlap(player, enemy, onCatch, null, this);

  // 添加文本显示（用于调试，HEADLESS模式不可见但逻辑有效）
  this.add.text(10, 10, 'Use Arrow Keys to Move', {
    fontSize: '16px',
    fill: '#ffffff'
  });
}

function update(time, delta) {
  // 如果已被抓住，停止游戏逻辑
  if (window.__signals__.isCaught) {
    player.setVelocity(0, 0);
    enemy.setVelocity(0, 0);
    return;
  }

  // 玩家移动控制
  player.setVelocity(0, 0);

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
    const normalizedSpeed = PLAYER_SPEED / Math.sqrt(2);
    player.body.velocity.normalize().scale(normalizedSpeed);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算距离
  const distance = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新游戏状态信号
  window.__signals__.playerX = Math.round(player.x);
  window.__signals__.playerY = Math.round(player.y);
  window.__signals__.enemyX = Math.round(enemy.x);
  window.__signals__.enemyY = Math.round(enemy.y);
  window.__signals__.distance = Math.round(distance);
  window.__signals__.survivalTime = Math.round((time - startTime) / 1000);

  // 输出状态日志（每秒一次）
  if (Math.floor(time / 1000) !== Math.floor((time - delta) / 1000)) {
    console.log(JSON.stringify({
      type: 'gameState',
      playerPos: { x: window.__signals__.playerX, y: window.__signals__.playerY },
      enemyPos: { x: window.__signals__.enemyX, y: window.__signals__.enemyY },
      distance: window.__signals__.distance,
      survivalTime: window.__signals__.survivalTime,
      isCaught: window.__signals__.isCaught
    }));
  }
}

function onCatch() {
  window.__signals__.isCaught = true;
  
  console.log(JSON.stringify({
    type: 'gameover',
    message: 'Player caught by enemy!',
    survivalTime: window.__signals__.survivalTime,
    finalDistance: window.__signals__.distance
  }));
}

// 启动游戏
new Phaser.Game(config);