// 完整的 Phaser3 碰撞伤害与无敌帧系统
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
    this.invincible = false;
    this.invincibleDuration = 1000; // 1秒无敌时间
    this.blinkInterval = 100; // 闪烁间隔（毫秒）
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 35, 35);
    enemyGraphics.generateTexture('enemy', 35, 35);
    enemyGraphics.destroy();

    // 创建无敌状态纹理（绿色方块）
    const invincibleGraphics = this.add.graphics();
    invincibleGraphics.fillStyle(0x00ff00, 1);
    invincibleGraphics.fillRect(0, 0, 40, 40);
    invincibleGraphics.generateTexture('playerInvincible', 40, 40);
    invincibleGraphics.destroy();
  }

  create() {
    // 初始化信号记录
    window.__signals__ = {
      health: this.health,
      maxHealth: this.maxHealth,
      invincible: false,
      collisions: [],
      damageEvents: [],
      invincibleEvents: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人（固定位置便于测试）
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 400, y: 150 },
      { x: 600, y: 200 },
      { x: 300, y: 350 },
      { x: 500, y: 350 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI
    this.createUI();

    // 闪烁计时器引用
    this.blinkTimer = null;
  }

  createUI() {
    // 血量文字
    this.healthText = this.add.text(16, 16, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.healthText.setDepth(100);

    // 血条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(16, 50, 204, 24);
    this.healthBarBg.setDepth(99);

    // 血条边框
    this.healthBarBorder = this.add.graphics();
    this.healthBarBorder.lineStyle(2, 0xffffff, 1);
    this.healthBarBorder.strokeRect(16, 50, 204, 24);
    this.healthBarBorder.setDepth(101);

    // 血条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 无敌状态提示
    this.invincibleText = this.add.text(16, 85, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.invincibleText.setDepth(100);
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量百分比选择颜色
    const healthPercent = this.health / this.maxHealth;
    let color = 0x00ff00; // 绿色
    if (healthPercent <= 0.25) {
      color = 0xff0000; // 红色
    } else if (healthPercent <= 0.5) {
      color = 0xff8800; // 橙色
    } else if (healthPercent <= 0.75) {
      color = 0xffff00; // 黄色
    }

    this.healthBar.fillStyle(color, 1);
    const barWidth = 200 * (this.health / this.maxHealth);
    this.healthBar.fillRect(18, 52, barWidth, 20);
    this.healthBar.setDepth(100);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不受伤害
    if (this.invincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);

    // 记录伤害事件
    const damageEvent = {
      timestamp: this.time.now,
      healthBefore: this.health + 1,
      healthAfter: this.health,
      enemyPosition: { x: enemy.x, y: enemy.y }
    };
    window.__signals__.damageEvents.push(damageEvent);
    window.__signals__.health = this.health;

    console.log(`[DAMAGE] Health: ${this.health}/${this.maxHealth}`, damageEvent);

    // 更新UI
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    this.updateHealthBar();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 启动无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.invincible = true;
    window.__signals__.invincible = true;

    const invincibleEvent = {
      timestamp: this.time.now,
      duration: this.invincibleDuration
    };
    window.__signals__.invincibleEvents.push(invincibleEvent);

    console.log(`[INVINCIBLE] Started for ${this.invincibleDuration}ms`);

    // 更新UI提示
    this.invincibleText.setText('INVINCIBLE!');

    // 启动闪烁效果
    this.startBlinking();

    // 设置无敌结束计时器
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  startBlinking() {
    let isVisible = true;
    let blinkCount = 0;
    const maxBlinks = Math.floor(this.invincibleDuration / this.blinkInterval);

    this.blinkTimer = this.time.addEvent({
      delay: this.blinkInterval,
      callback: () => {
        blinkCount++;
        isVisible = !isVisible;

        if (isVisible) {
          // 显示绿色无敌纹理
          this.player.setTexture('playerInvincible');
          this.player.setAlpha(1);
        } else {
          // 半透明效果
          this.player.setAlpha(0.3);
        }

        // 停止闪烁
        if (blinkCount >= maxBlinks) {
          this.blinkTimer.remove();
        }
      },
      loop: true
    });
  }

  endInvincibility() {
    this.invincible = false;
    window.__signals__.invincible = false;

    console.log('[INVINCIBLE] Ended');

    // 恢复正常外观
    this.player.setTexture('player');
    this.player.setAlpha(1);

    // 清除UI提示
    this.invincibleText.setText('');

    // 清除闪烁计时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
      this.blinkTimer = null;
    }
  }

  gameOver() {
    console.log('[GAME OVER] Health depleted');
    
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文字
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      stroke: '#000000',
      strokeThickness: 8
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setDepth(200);

    const restartText = this.add.text(400, 380, 'Click to Restart', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(200);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 玩家移动控制
    if (!this.physics.world.isPaused) {
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

    // 更新碰撞记录（用于验证）
    window.__signals__.collisions = [{
      playerPos: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      invincible: this.invincible,
      health: this.health
    }];
  }
}

// Phaser 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态
console.log('[INIT] Game started with:', {
  maxHealth: 8,
  invincibleDuration: 1000,
  blinkInterval: 100
});