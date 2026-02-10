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
let health = 100;
let isInvulnerable = false;
let healthText;
let statusText;

function preload() {
  // 创建黄色角色纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFFF00, 1);
  graphics.fillCircle(20, 20, 20);
  graphics.generateTexture('player', 40, 40);
  graphics.destroy();

  // 创建红色敌人纹理
  const enemyGraphics = this.add.graphics();
  enemyGraphics.fillStyle(0xFF0000, 1);
  enemyGraphics.fillRect(0, 0, 40, 40);
  enemyGraphics.generateTexture('enemy', 40, 40);
  enemyGraphics.destroy();
}

function create() {
  // 创建玩家（黄色角色）
  player = this.physics.add.sprite(400, 300, 'player');
  player.setCollideWorldBounds(true);
  player.body.setCircle(20);

  // 创建敌人
  enemy = this.physics.add.sprite(200, 300, 'enemy');
  enemy.setVelocity(80, 0); // 设置敌人移动速度
  enemy.setBounce(1, 1);
  enemy.setCollideWorldBounds(true);

  // 设置碰撞检测
  this.physics.add.overlap(player, enemy, handleCollision, null, this);

  // 键盘控制
  this.cursors = this.input.keyboard.createCursorKeys();

  // 显示状态信息
  healthText = this.add.text(16, 16, `Health: ${health}`, {
    fontSize: '24px',
    fill: '#ffffff'
  });

  statusText = this.add.text(16, 50, 'Status: Normal', {
    fontSize: '20px',
    fill: '#00ff00'
  });

  // 提示文本
  this.add.text(16, 550, 'Use Arrow Keys to Move | Collide with Red Enemy to Test Hurt Effect', {
    fontSize: '16px',
    fill: '#aaaaaa'
  });
}

function update() {
  // 玩家移动控制
  if (!isInvulnerable) {
    player.setVelocity(0);

    if (this.cursors.left.isDown) {
      player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      player.setVelocityX(160);
    }

    if (this.cursors.up.isDown) {
      player.setVelocityY(-160);
    } else if (this.cursors.down.isDown) {
      player.setVelocityY(160);
    }
  }
}

function handleCollision(player, enemy) {
  // 如果已经处于无敌状态，不触发受伤
  if (isInvulnerable) {
    return;
  }

  // 减少生命值
  health -= 10;
  healthText.setText(`Health: ${health}`);

  // 设置无敌状态
  isInvulnerable = true;
  statusText.setText('Status: Hurt (Invulnerable)');
  statusText.setColor('#ff0000');

  // 计算击退方向（从敌人位置指向玩家）
  const angle = Phaser.Math.Angle.Between(
    enemy.x, enemy.y,
    player.x, player.y
  );

  // 击退距离基于速度80计算（速度80对应击退距离80像素）
  const knockbackDistance = 80;
  const knockbackX = Math.cos(angle) * knockbackDistance;
  const knockbackY = Math.sin(angle) * knockbackDistance;

  // 停止玩家当前移动
  player.setVelocity(0, 0);

  // 使用 Tween 实现击退效果
  player.scene.tweens.add({
    targets: player,
    x: player.x + knockbackX,
    y: player.y + knockbackY,
    duration: 200,
    ease: 'Power2',
    onComplete: () => {
      // 击退完成后恢复控制
    }
  });

  // 实现闪烁效果（2秒内闪烁）
  let blinkCount = 0;
  const maxBlinks = 10; // 2秒内闪烁10次
  const blinkInterval = 200; // 每次闪烁间隔200ms

  const blinkTimer = player.scene.time.addEvent({
    delay: blinkInterval,
    callback: () => {
      blinkCount++;
      // 切换透明度
      player.alpha = player.alpha === 1 ? 0.3 : 1;

      // 闪烁结束
      if (blinkCount >= maxBlinks) {
        player.alpha = 1;
        isInvulnerable = false;
        statusText.setText('Status: Normal');
        statusText.setColor('#00ff00');
        blinkTimer.remove();
      }
    },
    loop: true
  });

  // 检查游戏结束
  if (health <= 0) {
    statusText.setText('Status: Game Over');
    statusText.setColor('#ff0000');
    player.scene.physics.pause();
  }
}

new Phaser.Game(config);