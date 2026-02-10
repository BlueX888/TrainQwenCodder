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
let isInvincible = false;
let health = 3;
let hitCount = 0;
let healthText;
let hitCountText;
let statusText;

const PLAYER_SPEED = 200;
const KNOCKBACK_SPEED = 80;
const INVINCIBLE_DURATION = 2000; // 2秒无敌时间
const BLINK_DURATION = 2000; // 2秒闪烁时间

function preload() {
  // 使用Graphics创建纹理，无需外部资源
}

function create() {
  // 创建粉色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0xff69b4, 1); // 粉色
  playerGraphics.fillCircle(20, 20, 20);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1); // 红色
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();

  // 创建玩家精灵
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);

  // 创建敌人精灵（可移动）
  enemy = this.physics.add.sprite(200, 300, 'enemy');
  enemy.setCollideWorldBounds(true);
  enemy.setVelocity(100, 50); // 敌人移动
  enemy.setBounce(1, 1); // 碰到边界反弹

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleHit, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  healthText = this.add.text(16, 16, `生命值: ${health}`, {
    fontSize: '24px',
    fill: '#fff'
  });

  hitCountText = this.add.text(16, 48, `受伤次数: ${hitCount}`, {
    fontSize: '24px',
    fill: '#fff'
  });

  statusText = this.add.text(16, 80, '状态: 正常', {
    fontSize: '24px',
    fill: '#0f0'
  });

  // 添加说明文字
  this.add.text(16, 550, '方向键移动 | 碰到红色方块会受伤', {
    fontSize: '18px',
    fill: '#888'
  });
}

function update() {
  // 玩家移动控制
  if (!isInvincible) {
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
  }
}

function handleHit(player, enemy) {
  // 如果正在无敌状态，不处理碰撞
  if (isInvincible) {
    return;
  }

  // 设置无敌状态
  isInvincible = true;

  // 减少生命值
  health--;
  hitCount++;
  healthText.setText(`生命值: ${health}`);
  hitCountText.setText(`受伤次数: ${hitCount}`);
  statusText.setText('状态: 受伤中');
  statusText.setColor('#f00');

  // 计算击退方向
  const angle = Phaser.Math.Angle.Between(
    enemy.x,
    enemy.y,
    player.x,
    player.y
  );

  // 应用击退效果（速度为80）
  const knockbackVelocityX = Math.cos(angle) * KNOCKBACK_SPEED;
  const knockbackVelocityY = Math.sin(angle) * KNOCKBACK_SPEED;
  
  player.setVelocity(knockbackVelocityX, knockbackVelocityY);

  // 闪烁效果（2秒内循环闪烁）
  const blinkTween = this.tweens.add({
    targets: player,
    alpha: 0.3,
    duration: 100,
    yoyo: true,
    repeat: Math.floor(BLINK_DURATION / 200) - 1, // 计算重复次数
    onComplete: () => {
      player.alpha = 1; // 确保最后恢复完全不透明
    }
  });

  // 2秒后解除无敌状态
  this.time.delayedCall(INVINCIBLE_DURATION, () => {
    isInvincible = false;
    player.setVelocity(0); // 停止击退
    statusText.setText('状态: 正常');
    statusText.setColor('#0f0');

    // 检查游戏是否结束
    if (health <= 0) {
      statusText.setText('状态: 游戏结束');
      statusText.setColor('#f00');
      this.physics.pause();
      
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#f00'
      }).setOrigin(0.5);
    }
  });
}

new Phaser.Game(config);