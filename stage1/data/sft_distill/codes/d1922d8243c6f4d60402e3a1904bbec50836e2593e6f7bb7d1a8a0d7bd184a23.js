class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 5;
    this.maxHealth = 5;
    this.isInvincible = false;
    this.invincibleDuration = 2000; // 2秒无敌时间
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建紫色纹理（无敌状态）
    const invincibleGraphics = this.add.graphics();
    invincibleGraphics.fillStyle(0x9900ff, 1);
    invincibleGraphics.fillRect(0, 0, 40, 40);
    invincibleGraphics.generateTexture('invincible', 40, 40);
    invincibleGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，设置随机移动
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        100 + i * 250,
        100 + i * 100,
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量UI
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'Arial'
    });
    this.updateHealthUI();

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态信号（用于验证）
    this.gameState = {
      health: this.health,
      isInvincible: this.isInvincible,
      isGameOver: false
    };
  }

  update() {
    if (this.health <= 0) {
      return; // 游戏结束，停止更新
    }

    // 玩家移动控制
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
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.gameState.health = this.health;
    this.updateHealthUI();

    // 检查游戏是否结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;
    this.gameState.isInvincible = true;

    // 创建闪烁效果（紫色与原色交替）
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(this.invincibleDuration / 300) - 1,
      onUpdate: (tween) => {
        // 在闪烁过程中切换纹理颜色
        if (tween.progress < 0.5) {
          this.player.setTexture('invincible');
        } else {
          this.player.setTexture('player');
        }
      },
      onComplete: () => {
        this.player.setAlpha(1);
        this.player.setTexture('player');
      }
    });

    // 设置无敌时间结束
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.gameState.isInvincible = false;
    });
  }

  updateHealthUI() {
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    
    // 根据血量改变文本颜色
    if (this.health <= 1) {
      this.healthText.setColor('#ff0000');
    } else if (this.health <= 2) {
      this.healthText.setColor('#ffaa00');
    } else {
      this.healthText.setColor('#ffffff');
    }
  }

  gameOver() {
    this.gameState.isGameOver = true;
    
    // 停止玩家移动
    this.player.setVelocity(0);
    this.physics.pause();

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 添加重启提示
    const restartText = this.add.text(400, 370, 'Press SPACE to Restart', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);

    // 监听空格键重启
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.restart();
      this.health = this.maxHealth;
      this.isInvincible = false;
      this.gameState = {
        health: this.health,
        isInvincible: false,
        isGameOver: false
      };
    });
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