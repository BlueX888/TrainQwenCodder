class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 状态信号：生命值
    this.isInvincible = false; // 无敌状态
    this.hitCount = 0; // 受击次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建紫色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9933ff, 1); // 紫色
    playerGraphics.fillCircle(25, 25, 25);
    playerGraphics.generateTexture('player', 50, 50);
    playerGraphics.destroy();

    // 创建敌人纹理（红色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff3333, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 200, y: 400 },
      { x: 600, y: 400 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.hitCountText = this.add.text(16, 50, `Hits: ${this.hitCount}`, {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(16, 84, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示信息
    this.add.text(400, 550, 'Use Arrow Keys to Move. Touch Red Squares to Trigger Hit Effect!', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 减少生命值
    this.health--;
    this.hitCount++;
    this.healthText.setText(`Health: ${this.health}`);
    this.hitCountText.setText(`Hits: ${this.hitCount}`);

    // 设置无敌状态
    this.isInvincible = true;
    this.statusText.setText('Status: Invincible (Hurt)');
    this.statusText.setColor('#ff0000');

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度240（240像素/秒 * 0.3秒 = 72像素）
    const knockbackSpeed = 240;
    const knockbackTime = 300; // 0.3秒
    const knockbackDistance = (knockbackSpeed * knockbackTime) / 1000;

    const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
    const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 击退动画
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: knockbackTime,
      ease: 'Cubic.easeOut'
    });

    // 闪烁效果：2秒内alpha在0.2和1之间切换
    const blinkTween = this.tweens.add({
      targets: player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 19, // 100ms * 2 * 20 = 2000ms = 2秒
      onComplete: () => {
        player.alpha = 1; // 确保最终恢复完全不透明
      }
    });

    // 2秒后解除无敌状态
    this.time.delayedCall(2000, () => {
      this.isInvincible = false;
      this.statusText.setText('Status: Normal');
      this.statusText.setColor('#00ff00');
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.statusText.setText('Status: Game Over!');
      this.statusText.setColor('#ff0000');
      this.physics.pause();
      
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '64px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
    }
  }

  update(time, delta) {
    // 如果游戏结束，停止更新
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制（仅在非无敌状态或无敌但可移动时）
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

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
  scene: GameScene
};

new Phaser.Game(config);