class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
    this.isInvincible = false;
    this.invincibleDuration = 3000; // 3秒无敌
  }

  preload() {
    // 创建纯色纹理
    this.createColorTexture('player', 0x00ff00, 32, 32); // 绿色玩家
    this.createColorTexture('enemy', 0xff0000, 32, 32);  // 红色敌人
    this.createColorTexture('heart', 0xff69b4, 20, 20);  // 粉色心形
  }

  createColorTexture(key, color, width, height) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量UI
    this.createHealthUI();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(10, 10, '使用方向键移动\n碰撞敌人扣1血\n无敌时闪烁粉色', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 状态显示（用于验证）
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });
    this.updateStatusText();
  }

  createHealthUI() {
    this.healthIcons = [];
    const startX = 650;
    const startY = 30;
    const spacing = 25;

    this.add.text(startX - 80, startY - 5, 'Health:', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.image(
        startX + (i % 4) * spacing,
        startY + Math.floor(i / 4) * spacing,
        'heart'
      );
      this.healthIcons.push(heart);
    }
  }

  updateHealthUI() {
    this.healthIcons.forEach((heart, index) => {
      if (index < this.health) {
        heart.setAlpha(1);
        heart.setTint(0xff69b4); // 粉色
      } else {
        heart.setAlpha(0.3);
        heart.setTint(0x666666); // 灰色
      }
    });
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.updateHealthUI();
    this.updateStatusText();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 启动无敌帧
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果（粉色tint + alpha变化）
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      tint: 0xff69b4, // 粉色
      duration: 150,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 3秒后结束无敌
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  endInvincibility() {
    this.isInvincible = false;

    // 停止闪烁
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 恢复正常外观
    this.player.setAlpha(1);
    this.player.clearTint();
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 380, 'Press R to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `Status: Health=${this.health}/${this.maxHealth} | Invincible=${this.isInvincible}`
    );
  }

  update(time, delta) {
    if (this.health <= 0) {
      return; // 游戏结束后不更新
    }

    // 玩家移动
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 更新状态文本
    this.updateStatusText();
  }
}

// 游戏配置
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

// 启动游戏
new Phaser.Game(config);