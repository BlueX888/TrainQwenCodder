class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 10;
    this.isInvincible = false;
    this.invincibleDuration = 2500; // 2.5秒
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      collisions: [],
      healthChanges: [],
      invincibleStates: []
    };

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量显示
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.healthText.setDepth(100);

    // 创建无敌状态显示
    this.invincibleText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial'
    });
    this.invincibleText.setDepth(100);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 记录初始状态
    this.logSignal('healthChanges', {
      time: 0,
      health: this.health,
      reason: 'initial'
    });
  }

  update(time, delta) {
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

    // 更新无敌状态显示
    if (this.isInvincible) {
      this.invincibleText.setText('INVINCIBLE');
    } else {
      this.invincibleText.setText('');
    }

    // 游戏结束检测
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.healthText.setText(`Health: ${this.health}`);

    // 记录碰撞信号
    this.logSignal('collisions', {
      time: this.time.now,
      playerPos: { x: player.x, y: player.y },
      enemyPos: { x: enemy.x, y: enemy.y },
      healthAfter: this.health
    });

    // 记录血量变化信号
    this.logSignal('healthChanges', {
      time: this.time.now,
      health: this.health,
      reason: 'collision'
    });

    // 触发无敌状态
    this.activateInvincibility();

    // 检查游戏结束
    if (this.health <= 0) {
      this.logSignal('healthChanges', {
        time: this.time.now,
        health: this.health,
        reason: 'death'
      });
    }
  }

  activateInvincibility() {
    this.isInvincible = true;

    // 记录无敌状态开始
    this.logSignal('invincibleStates', {
      time: this.time.now,
      state: 'start',
      duration: this.invincibleDuration
    });

    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(this.invincibleDuration / 300) - 1,
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvincible = false;

        // 记录无敌状态结束
        this.logSignal('invincibleStates', {
          time: this.time.now,
          state: 'end'
        });
      }
    });
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(200);

    // 记录游戏结束信号
    this.logSignal('healthChanges', {
      time: this.time.now,
      health: 0,
      reason: 'game_over'
    });

    // 输出最终信号统计
    console.log('=== Final Signals ===');
    console.log(JSON.stringify(window.__signals__, null, 2));
  }

  logSignal(category, data) {
    if (!window.__signals__[category]) {
      window.__signals__[category] = [];
    }
    window.__signals__[category].push(data);
    console.log(`[${category}]`, JSON.stringify(data));
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