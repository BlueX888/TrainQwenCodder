class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      health: this.health,
      collisions: 0,
      invincibleActivations: 0,
      gameOver: false
    };

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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人（往返移动）
    this.enemies = this.physics.add.group();
    
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    enemy1.setVelocityX(100);
    enemy1.setBounce(1, 0);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(600, 300, 'enemy');
    enemy2.setVelocityX(-120);
    enemy2.setBounce(1, 0);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(400, 150, 'enemy');
    enemy3.setVelocityX(80);
    enemy3.setBounce(1, 0);
    enemy3.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

    // 创建血量UI
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#ff0000',
      fontStyle: 'bold'
    });
    this.updateHealthDisplay();

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(400, 550, '', {
      fontSize: '24px',
      fill: '#ffff00',
      fontStyle: 'bold'
    });
    this.invincibleText.setOrigin(0.5);

    // 创建游戏说明
    this.add.text(400, 50, '使用方向键移动，避开红色敌人', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 游戏结束标志
    this.gameOver = false;

    console.log('[GAME START]', JSON.stringify(window.__signals__));
  }

  update() {
    if (this.gameOver) {
      return;
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
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible || this.gameOver) {
      return;
    }

    // 扣血
    this.health -= 1;
    window.__signals__.health = this.health;
    window.__signals__.collisions += 1;

    console.log('[COLLISION]', JSON.stringify({
      health: this.health,
      collisions: window.__signals__.collisions,
      timestamp: Date.now()
    }));

    // 更新血量显示
    this.updateHealthDisplay();

    // 检查游戏是否结束
    if (this.health <= 0) {
      this.handleGameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    window.__signals__.invincibleActivations += 1;

    console.log('[INVINCIBLE START]', JSON.stringify({
      duration: this.invincibleDuration,
      timestamp: Date.now()
    }));

    // 显示无敌提示
    this.invincibleText.setText('无敌中...');

    // 创建闪烁效果（快速切换透明度）
    const blinkTimeline = this.tweens.timeline({
      targets: this.player,
      loop: 4, // 闪烁5次（0.5秒内，每次0.1秒）
      tweens: [
        {
          alpha: 0.2,
          duration: 50,
          ease: 'Linear'
        },
        {
          alpha: 1,
          duration: 50,
          ease: 'Linear'
        }
      ]
    });

    // 0.5秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.player.alpha = 1; // 确保透明度恢复
      this.invincibleText.setText('');

      console.log('[INVINCIBLE END]', JSON.stringify({
        timestamp: Date.now()
      }));
    });
  }

  updateHealthDisplay() {
    // 使用心形符号显示血量
    const hearts = '❤️'.repeat(this.health);
    const emptyHearts = '🖤'.repeat(3 - this.health);
    this.healthText.setText(`血量: ${hearts}${emptyHearts}`);
  }

  handleGameOver() {
    this.gameOver = true;
    window.__signals__.gameOver = true;

    console.log('[GAME OVER]', JSON.stringify(window.__signals__));

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    // 显示重启提示
    const restartText = this.add.text(400, 380, '刷新页面重新开始', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 玩家变灰
    this.player.setTint(0x888888);
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