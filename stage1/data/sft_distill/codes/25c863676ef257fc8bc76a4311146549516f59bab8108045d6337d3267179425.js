class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
    this.signals = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = this.signals;
    this.logSignal('game_start', { health: this.health });

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

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        100 + i * 250,
        100 + Math.random() * 200,
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量UI
    this.createHealthUI();

    // 游戏结束文本（隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 提示文本
    this.add.text(10, 10, 'Arrow Keys: Move | Avoid Red Enemies!', {
      fontSize: '18px',
      color: '#ffffff'
    });
  }

  createHealthUI() {
    // 血量容器
    this.healthContainer = this.add.container(650, 550);

    // 血量背景文本
    const healthLabel = this.add.text(0, 0, 'Health: ', {
      fontSize: '24px',
      color: '#ffffff'
    });
    this.healthContainer.add(healthLabel);

    // 血量方块
    this.healthBlocks = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.add.graphics();
      block.fillStyle(0xff0000, 1);
      block.fillRect(80 + i * 35, 0, 30, 30);
      this.healthContainer.add(block);
      this.healthBlocks.push(block);
    }
  }

  updateHealthUI() {
    // 更新血量显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        this.healthBlocks[i].setAlpha(1);
      } else {
        this.healthBlocks[i].setAlpha(0.2);
      }
    }
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health--;
    this.logSignal('collision', {
      health: this.health,
      enemyX: Math.round(enemy.x),
      enemyY: Math.round(enemy.y)
    });

    // 更新UI
    this.updateHealthUI();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.logSignal('invincibility_start', { duration: 500 });

    // 创建闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 闪烁5次，共0.5秒
      onComplete: () => {
        this.player.setAlpha(1);
        this.isInvincible = false;
        this.logSignal('invincibility_end', { health: this.health });
      }
    });
  }

  gameOver() {
    this.logSignal('game_over', { finalHealth: 0 });
    
    // 停止物理系统
    this.physics.pause();
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    // 玩家变灰
    this.player.setTint(0x888888);
  }

  update(time, delta) {
    // 游戏结束后不更新
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制
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

    // 敌人随机改变方向
    this.enemies.children.entries.forEach(enemy => {
      if (Math.random() < 0.01) {
        enemy.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(-100, 100)
        );
      }
    });
  }

  logSignal(event, data) {
    const signal = {
      timestamp: Date.now(),
      event: event,
      data: data
    };
    this.signals.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
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