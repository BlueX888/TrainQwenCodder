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
let health = 3; // 可验证状态信号
let isHurt = false; // 受伤状态标记
let healthText;
let statusText;

function preload() {
  // 创建蓝色玩家纹理
  const playerGraphics = this.add.graphics();
  playerGraphics.fillStyle(0x0000ff, 1);
  playerGraphics.fillRect(0, 0, 40, 40);
  playerGraphics.generateTexture('player', 40, 40);
  playerGraphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(20, 20, 20);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家（蓝色方块）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setSize(40, 40);

  // 创建敌人（红色圆形）
  enemy = this.physics.add.sprite(200, 300, 'enemy');
  enemy.setVelocity(100, 50);
  enemy.setBounce(1, 1);
  enemy.setCollideWorldBounds(true);

  // 添加碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 键盘控制
  cursors = this.input.keyboard.createCursorKeys();

  // UI 文本
  healthText = this.add.text(16, 16, `Health: ${health}`, {
    fontSize: '24px',
    fill: '#fff'
  });

  statusText = this.add.text(16, 50, 'Use arrow keys to move', {
    fontSize: '18px',
    fill: '#aaa'
  });

  // 说明文本
  this.add.text(400, 550, 'Touch the red enemy to see hurt effect', {
    fontSize: '16px',
    fill: '#888',
    align: 'center'
  }).setOrigin(0.5);
}

function update() {
  // 玩家移动控制
  if (!isHurt) {
    if (cursors.left.isDown) {
      player.setVelocityX(-200);
    } else if (cursors.right.isDown) {
      player.setVelocityX(200);
    } else {
      player.setVelocityX(0);
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-200);
    } else if (cursors.down.isDown) {
      player.setVelocityY(200);
    } else {
      player.setVelocityY(0);
    }
  }
}

function handleCollision(player, enemy) {
  // 如果已经在受伤状态，不重复触发
  if (isHurt) return;

  // 标记受伤状态
  isHurt = true;

  // 减少生命值
  health--;
  healthText.setText(`Health: ${health}`);

  if (health <= 0) {
    statusText.setText('Game Over! Refresh to restart');
    statusText.setColor('#ff0000');
    player.setTint(0x888888);
    this.physics.pause();
    return;
  }

  // 计算击退方向（从敌人指向玩家）
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );

  // 击退距离基于速度 240
  const knockbackDistance = 240 * 0.3; // 0.3 秒的移动距离
  const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
  const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

  // 停止玩家当前速度
  player.setVelocity(0, 0);

  // 击退动画（使用 tween）
  this.tweens.add({
    targets: player,
    x: knockbackX,
    y: knockbackY,
    duration: 300,
    ease: 'Power2'
  });

  // 闪烁效果（0.5 秒内切换 alpha）
  let blinkCount = 0;
  const blinkInterval = 50; // 每 50ms 切换一次
  const totalBlinks = 10; // 0.5 秒内闪烁 10 次

  const blinkTimer = this.time.addEvent({
    delay: blinkInterval,
    callback: () => {
      player.alpha = player.alpha === 1 ? 0.3 : 1;
      blinkCount++;

      if (blinkCount >= totalBlinks) {
        // 恢复正常状态
        player.alpha = 1;
        isHurt = false;
        blinkTimer.remove();
        statusText.setText('Hurt effect completed! Move again');
        
        // 3 秒后恢复提示文本
        this.time.delayedCall(3000, () => {
          if (health > 0) {
            statusText.setText('Use arrow keys to move');
          }
        });
      }
    },
    loop: true
  });

  // 状态提示
  statusText.setText('HURT! Knockback & Blinking...');
  statusText.setColor('#ff6666');
  
  // 0.5 秒后恢复文本颜色
  this.time.delayedCall(500, () => {
    statusText.setColor('#aaa');
  });
}

const game = new Phaser.Game(config);