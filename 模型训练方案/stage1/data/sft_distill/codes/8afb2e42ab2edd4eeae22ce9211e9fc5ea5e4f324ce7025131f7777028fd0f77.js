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
let player;
let enemy;
let cursors;
let health = 100;
let score = 0;
let healthText;
let scoreText;
let statusText;

const PLAYER_SPEED = 200 * 1.2; // 240
const ENEMY_SPEED = 200;

function preload() {
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
}

function create() {
  // 创建玩家
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人
  enemy = this.physics.add.sprite(100, 100, 'enemy');
  enemy.setCollideWorldBounds(true);

  // 设置键盘输入
  cursors = this.input.keyboard.createCursorKeys();

  // 添加WASD键支持
  this.wasd = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 碰撞检测
  this.physics.add.overlap(player, enemy, hitEnemy, null, this);

  // 创建UI文本
  healthText = this.add.text(16, 16, 'Health: 100', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  scoreText = this.add.text(16, 46, 'Score: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  statusText = this.add.text(400, 16, 'Use Arrow Keys or WASD to move. Avoid the orange enemy!', {
    fontSize: '16px',
    fill: '#ffff00'
  });
  statusText.setOrigin(0.5, 0);

  // 添加提示文本
  this.add.text(400, 580, 'Player Speed: 240 | Enemy Speed: 200', {
    fontSize: '14px',
    fill: '#aaaaaa'
  }).setOrigin(0.5, 1);
}

function update(time, delta) {
  // 重置玩家速度
  player.setVelocity(0);

  // 处理玩家移动（方向键）
  if (cursors.left.isDown || this.wasd.left.isDown) {
    player.setVelocityX(-PLAYER_SPEED);
  } else if (cursors.right.isDown || this.wasd.right.isDown) {
    player.setVelocityX(PLAYER_SPEED);
  }

  if (cursors.up.isDown || this.wasd.up.isDown) {
    player.setVelocityY(-PLAYER_SPEED);
  } else if (cursors.down.isDown || this.wasd.down.isDown) {
    player.setVelocityY(PLAYER_SPEED);
  }

  // 对角线移动时归一化速度
  if (player.body.velocity.x !== 0 && player.body.velocity.y !== 0) {
    player.body.velocity.normalize().scale(PLAYER_SPEED);
  }

  // 敌人追踪玩家
  this.physics.moveToObject(enemy, player, ENEMY_SPEED);

  // 每秒增加分数（存活时间）
  if (time % 100 < delta) {
    score += 1;
    scoreText.setText('Score: ' + score);
  }

  // 游戏结束检测
  if (health <= 0) {
    this.physics.pause();
    statusText.setText('GAME OVER! Final Score: ' + score);
    statusText.setStyle({ fill: '#ff0000', fontSize: '24px' });
  }
}

function hitEnemy(player, enemy) {
  // 受到伤害
  health -= 10;
  healthText.setText('Health: ' + health);

  // 击退效果
  const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
  player.setVelocity(
    Math.cos(angle) * 300,
    Math.sin(angle) * 300
  );

  // 敌人短暂后退
  enemy.setVelocity(
    -Math.cos(angle) * 150,
    -Math.sin(angle) * 150
  );

  // 闪烁效果
  player.setTint(0xff0000);
  this.time.delayedCall(200, () => {
    player.clearTint();
  });

  // 检查游戏结束
  if (health <= 0) {
    health = 0;
    healthText.setText('Health: 0');
  }
}

new Phaser.Game(config);