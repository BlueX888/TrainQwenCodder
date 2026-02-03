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

// 游戏状态变量
let player;
let enemy;
let cursors;
let statusText;
let gameState = {
  health: 100,
  isHurt: false,
  isInvincible: false,
  knockbackSpeed: 160
};

function preload() {
  // 创建青色玩家纹理
  const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  playerGraphics.fillStyle(0x00ffff, 1); // 青色
  playerGraphics.fillCircle(20, 20, 20);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
  enemyGraphics.fillStyle(0xff0000, 1); // 红色
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家（青色圆形）
  player = this.physics.add.sprite(200, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setCircle(20);
  player.body.setOffset(0, 0);

  // 创建敌人（红色方块）
  enemy = this.physics.add.sprite(600, 300, 'enemy');
  enemy.setCollideWorldBounds(true);
  
  // 敌人简单移动
  this.tweens.add({
    targets: enemy,
    y: 400,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 状态显示
  statusText = this.add.text(16, 16, '', {
    fontSize: '18px',
    fill: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });

  updateStatusText();
}

function update() {
  // 玩家移动控制
  if (!gameState.isHurt) {
    player.setVelocity(0);

    if (cursors.left.isDown) {
      player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      player.setVelocityX(200);
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-200);
    } else if (cursors.down.isDown) {
      player.setVelocityY(200);
    }
  }

  updateStatusText();
}

function handleCollision(player, enemy) {
  // 如果正在无敌时间，不触发受伤
  if (gameState.isInvincible) {
    return;
  }

  // 触发受伤效果
  triggerHurtEffect.call(this, player, enemy);
}

function triggerHurtEffect(player, enemy) {
  // 设置受伤状态
  gameState.isHurt = true;
  gameState.isInvincible = true;
  gameState.health -= 10;

  // 计算击退方向
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );
  
  // 计算击退距离（基于速度160，假设击退时间0.3秒）
  const knockbackDistance = gameState.knockbackSpeed * 0.3;
  const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
  const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

  // 停止玩家当前速度
  player.setVelocity(0);

  // 击退动画
  this.tweens.add({
    targets: player,
    x: knockbackX,
    y: knockbackY,
    duration: 300,
    ease: 'Power2',
    onComplete: () => {
      gameState.isHurt = false;
    }
  });

  // 闪烁效果（4秒）
  const blinkTween = this.tweens.add({
    targets: player,
    alpha: 0.3,
    duration: 200,
    yoyo: true,
    repeat: 19, // 20次循环 = 4秒（每次0.2秒 * 2）
    ease: 'Linear'
  });

  // 4秒后结束无敌状态
  this.time.delayedCall(4000, () => {
    gameState.isInvincible = false;
    player.alpha = 1; // 确保完全不透明
  });

  console.log(`Player hurt! Health: ${gameState.health}, Knockback to (${Math.round(knockbackX)}, ${Math.round(knockbackY)})`);
}

function updateStatusText() {
  statusText.setText([
    `Health: ${gameState.health}`,
    `Is Hurt: ${gameState.isHurt}`,
    `Invincible: ${gameState.isInvincible}`,
    `Player Pos: (${Math.round(player.x)}, ${Math.round(player.y)})`,
    `Player Alpha: ${player.alpha.toFixed(2)}`,
    '',
    'Use Arrow Keys to Move',
    'Collide with Red Enemy to Test'
  ]);
}

const game = new Phaser.Game(config);