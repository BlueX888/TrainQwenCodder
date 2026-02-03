class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
    this.isInvincible = false;
    this.invincibleTimer = null;
    this.blinkTimer = null;
    this.player = null;
    this.enemy = null;
    this.healthBar = null;
    this.healthText = null;
    this.cursors = null;
    
    // 验证信号
    window.__signals__ = {
      health: this.health,
      collisions: 0,
      invincibleActivations: 0,
      damageEvents: [],
      gameOver: false
    };
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
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
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人
    this.enemy = this.physics.add.sprite(200, 150, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemy.body.setBounce(1, 1);
    this.enemy.setVelocity(150, 100);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.handleCollision, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量UI
    this.createHealthUI();

    // 添加说明文本
    this.add.text(10, 10, 'Arrow Keys: Move Player\nAvoid Red Enemy!\nHealth: 8/8', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 输出初始信号
    this.updateSignals();
  }

  createHealthUI() {
    // 血量条背景
    const barX = 10;
    const barY = 100;
    const barWidth = 200;
    const barHeight = 20;

    this.add.graphics()
      .fillStyle(0x333333, 1)
      .fillRect(barX, barY, barWidth, barHeight);

    // 血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(barX + barWidth + 10, barY, `${this.health}/${this.maxHealth}`, {
      fontSize: '18px',
      fill: '#ffffff'
    });
  }

  updateHealthBar() {
    const barX = 10;
    const barY = 100;
    const barWidth = 200;
    const barHeight = 20;
    
    this.healthBar.clear();
    
    const healthPercent = this.health / this.maxHealth;
    const currentWidth = barWidth * healthPercent;
    
    // 根据血量改变颜色
    let color = 0x00ff00; // 绿色
    if (healthPercent <= 0.25) {
      color = 0xff0000; // 红色
    } else if (healthPercent <= 0.5) {
      color = 0xff9900; // 橙色
    } else if (healthPercent <= 0.75) {
      color = 0xffff00; // 黄色
    }
    
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(barX, barY, currentWidth, barHeight);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    
    // 更新UI
    this.updateHealthBar();
    this.healthText.setText(`${this.health}/${this.maxHealth}`);

    // 记录伤害事件
    window.__signals__.collisions++;
    window.__signals__.damageEvents.push({
      timestamp: Date.now(),
      healthAfter: this.health,
      position: { x: player.x, y: player.y }
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 激活无敌帧
    this.activateInvincibility();
    
    this.updateSignals();
  }

  activateInvincibility() {
    this.isInvincible = true;
    window.__signals__.invincibleActivations++;

    // 保存原始颜色
    const originalTint = this.player.tint;

    // 变为绿色
    this.player.setTint(0x00ff00);

    // 闪烁效果
    let blinkCount = 0;
    this.blinkTimer = this.time.addEvent({
      delay: 100, // 每100ms切换一次
      callback: () => {
        blinkCount++;
        this.player.alpha = this.player.alpha === 1 ? 0.3 : 1;
      },
      loop: true
    });

    // 1秒后结束无敌
    this.invincibleTimer = this.time.delayedCall(1000, () => {
      this.isInvincible = false;
      this.player.setTint(0xffffff); // 恢复原色
      this.player.alpha = 1; // 恢复完全不透明
      
      if (this.blinkTimer) {
        this.blinkTimer.remove();
        this.blinkTimer = null;
      }

      console.log('Invincibility ended');
      this.updateSignals();
    });
  }

  gameOver() {
    window.__signals__.gameOver = true;
    this.updateSignals();

    // 停止敌人移动
    this.enemy.setVelocity(0, 0);

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    // 停止玩家控制
    this.cursors = null;

    console.log('Game Over! Final signals:', window.__signals__);
  }

  update(time, delta) {
    // 游戏结束后不更新
    if (window.__signals__.gameOver) {
      return;
    }

    // 玩家移动控制
    if (this.cursors) {
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

  updateSignals() {
    window.__signals__.health = this.health;
    window.__signals__.isInvincible = this.isInvincible;
    window.__signals__.timestamp = Date.now();
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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