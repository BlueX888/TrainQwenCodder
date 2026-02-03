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
let healthText;
let stateText;
let playerHealth = 100;
let isInvulnerable = false;
let blinkTween = null;

function preload() {
  // 创建粉色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff69b4, 1); // 粉色
  playerGraphics.fillCircle(25, 25, 25);
  playerGraphics.generateTexture('player', 50, 50);
  playerGraphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1); // 红色
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家（粉色角色）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setCircle(25);

  // 创建敌人
  enemy = this.physics.add.sprite(200, 200, 'enemy');
  enemy.setVelocity(100, 100);
  enemy.setBounce(1, 1);
  enemy.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // UI文本
  healthText = this.add.text(16, 16, `Health: ${playerHealth}`, {
    fontSize: '24px',
    fill: '#ffffff'
  });

  stateText = this.add.text(16, 50, 'State: Normal', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  // 提示文本
  this.add.text(400, 550, 'Arrow Keys to Move | Avoid Red Enemy', {
    fontSize: '18px',
    fill: '#ffffff'
  }).setOrigin(0.5);
}

function update() {
  // 玩家移动控制
  if (!isInvulnerable) {
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
}

function handleCollision(player, enemy) {
  // 如果已经处于无敌状态，不再触发受伤
  if (isInvulnerable) {
    return;
  }

  // 减少生命值
  playerHealth -= 10;
  healthText.setText(`Health: ${playerHealth}`);

  // 检查游戏结束
  if (playerHealth <= 0) {
    playerHealth = 0;
    healthText.setText(`Health: ${playerHealth}`);
    stateText.setText('State: Game Over').setColor('#ff0000');
    this.physics.pause();
    return;
  }

  // 设置无敌状态
  isInvulnerable = true;
  stateText.setText('State: Invulnerable (Hurt)').setColor('#ffff00');

  // 计算击退方向（从敌人指向玩家）
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );

  // 基于速度160计算击退距离
  const knockbackSpeed = 160;
  const knockbackDuration = 300; // 击退持续时间（毫秒）
  const knockbackDistance = (knockbackSpeed * knockbackDuration) / 1000;

  // 计算击退目标位置
  const targetX = player.x + Math.cos(angle) * knockbackDistance;
  const targetY = player.y + Math.sin(angle) * knockbackDistance;

  // 停止玩家当前移动
  player.setVelocity(0);

  // 执行击退效果
  this.tweens.add({
    targets: player,
    x: targetX,
    y: targetY,
    duration: knockbackDuration,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      player.setVelocity(0);
    }
  });

  // 闪烁效果（2.5秒，约12次闪烁）
  if (blinkTween) {
    blinkTween.stop();
  }

  blinkTween = this.tweens.add({
    targets: player,
    alpha: 0.2,
    duration: 100,
    ease: 'Linear',
    yoyo: true,
    repeat: 12, // 闪烁12次，总计2.4秒
    onComplete: () => {
      player.alpha = 1;
      isInvulnerable = false;
      stateText.setText('State: Normal').setColor('#00ff00');
      blinkTween = null;
    }
  });

  // 添加额外的定时器确保2.5秒后恢复（保险机制）
  this.time.delayedCall(2500, () => {
    if (isInvulnerable) {
      player.alpha = 1;
      isInvulnerable = false;
      stateText.setText('State: Normal').setColor('#00ff00');
      if (blinkTween) {
        blinkTween.stop();
        blinkTween = null;
      }
    }
  });
}

new Phaser.Game(config);