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

// 状态信号变量
let gameState = {
  survivalTime: 0,
  distanceToEnemy: 0,
  isAlive: true,
  escapeCount: 0
};

let player;
let enemy;
let cursors;
let gameOverText;
let statusText;

const PLAYER_SPEED = 360 * 1.2; // 432
const ENEMY_SPEED = 360;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 创建玩家纹理（蓝色圆形）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x3498db, 1);
  playerGraphics.fillCircle(20, 20, 20);
  playerGraphics.generateTexture('playerTexture', 40, 40);
  playerGraphics.destroy();

  // 创建敌人纹理（灰色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x7f8c8d, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemyTexture', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵（中心位置）
  player = this.physics.add.sprite(400, 300, 'playerTexture');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵（随机边缘位置）
  const startX = Phaser.Math.Between(0, 1) === 0 ? 50 : 750;
  const startY = Phaser.Math.Between(100, 500);
  enemy = this.physics.add.sprite(startX, startY, 'enemyTexture');

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, hitEnemy, null, this);

  // 创建状态文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '16px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 创建游戏结束文本（初始隐藏）
  gameOverText = this.add.text(400, 300, 'GAME OVER!\nEnemy Caught You!', {
    fontSize: '48px',
    fill: '#e74c3c',
    align: 'center',
    fontStyle: 'bold'
  });
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);

  // 重置游戏状态
  gameState.survivalTime = 0;
  gameState.isAlive = true;
  gameState.escapeCount = 0;
}

function update(time, delta) {
  if (!gameState.isAlive) {
    return;
  }

  // 更新存活时间
  gameState.survivalTime += delta / 1000;

  // 玩家移动控制
  player.setVelocity(0);

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

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );

  enemy.setVelocity(
    Math.cos(angle) * ENEMY_SPEED,
    Math.sin(angle) * ENEMY_SPEED
  );

  // 计算玩家与敌人的距离
  gameState.distanceToEnemy = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 如果距离增加，增加逃脱计数
  if (gameState.distanceToEnemy > 100) {
    gameState.escapeCount++;
  }

  // 更新状态文本
  statusText.setText([
    `Survival Time: ${gameState.survivalTime.toFixed(1)}s`,
    `Distance to Enemy: ${gameState.distanceToEnemy.toFixed(0)}px`,
    `Player Speed: ${PLAYER_SPEED}`,
    `Enemy Speed: ${ENEMY_SPEED}`,
    `Status: ${gameState.isAlive ? 'ALIVE' : 'CAUGHT'}`,
    `Escape Frames: ${gameState.escapeCount}`
  ]);
}

function hitEnemy(player, enemy) {
  // 游戏结束
  gameState.isAlive = false;

  // 停止所有移动
  player.setVelocity(0);
  enemy.setVelocity(0);

  // 显示游戏结束文本
  gameOverText.setVisible(true);

  // 更新最终状态
  statusText.setText([
    `GAME OVER!`,
    `Survival Time: ${gameState.survivalTime.toFixed(1)}s`,
    `Final Distance: ${gameState.distanceToEnemy.toFixed(0)}px`,
    `Total Escape Frames: ${gameState.escapeCount}`
  ]);
}

new Phaser.Game(config);