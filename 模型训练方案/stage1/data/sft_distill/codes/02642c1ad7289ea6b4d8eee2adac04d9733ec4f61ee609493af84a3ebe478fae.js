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

let player;
let enemy;
let cursors;
let statusText;
let distanceText;

// 状态信号变量（用于验证）
let health = 100;
let score = 0;
let distanceToEnemy = 0;

const PLAYER_SPEED = 200 * 1.2; // 240
const ENEMY_SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建玩家纹理（绿色方块）
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x00ff00, 1);
  playerGraphics.fillRect(0, 0, 32, 32);
  playerGraphics.generateTexture('playerTex', 32, 32);
  playerGraphics.destroy();

  // 创建敌人纹理（青色圆形）
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0x00ffff, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemyTex', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵（起始位置：中心）
  player = this.physics.add.sprite(400, 300, 'playerTex');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵（起始位置：左上角）
  enemy = this.physics.add.sprite(100, 100, 'enemyTex');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, onEnemyHit, null, this);

  // 创建状态显示文本
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  distanceText = this.add.text(16, 50, '', {
    fontSize: '16px',
    fill: '#ffff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  // 添加说明文本
  this.add.text(16, 550, '使用方向键移动玩家（绿色）躲避敌人（青色）', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });

  updateStatusText();
}

function update(time, delta) {
  // 重置玩家速度
  player.setVelocity(0);

  // 处理玩家移动输入
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
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 计算距离
  distanceToEnemy = Phaser.Math.Distance.Between(
    player.x, player.y,
    enemy.x, enemy.y
  );

  // 更新状态文本
  updateStatusText();
}

function onEnemyHit(player, enemy) {
  // 碰撞时扣血
  health -= 10;
  if (health < 0) health = 0;

  // 将敌人推开一段距离
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  enemy.x = player.x - Math.cos(angle) * 100;
  enemy.y = player.y - Math.sin(angle) * 100;

  // 更新分数（每次碰撞记录）
  score++;

  updateStatusText();

  // 如果生命值为0，显示游戏结束
  if (health <= 0) {
    statusText.setText('Health: 0 | Score: ' + score + ' | GAME OVER!');
    statusText.setStyle({ fill: '#ff0000' });
    this.physics.pause();
  }
}

function updateStatusText() {
  statusText.setText('Health: ' + health + ' | Score: ' + score);
  distanceText.setText(
    'Distance: ' + Math.floor(distanceToEnemy) + 'px | ' +
    'Player Speed: ' + PLAYER_SPEED + ' | Enemy Speed: ' + ENEMY_SPEED
  );
}

new Phaser.Game(config);