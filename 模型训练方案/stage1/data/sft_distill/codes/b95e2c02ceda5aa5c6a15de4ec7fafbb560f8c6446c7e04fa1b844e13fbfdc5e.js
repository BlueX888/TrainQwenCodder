// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  damageCount: 0,
  playerHealth: 100,
  isInvincible: false,
  knockbackEvents: [],
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.playerHealth = 100;
    this.isInvincible = false;
    this.blinkTimer = null;
    this.knockbackSpeed = 80;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
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
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(300, 300, 'enemy');
    this.enemy.setVelocity(50, 50);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.handleDamage, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 显示提示文本
    this.add.text(10, 550, 'Use arrow keys to move. Collide with red enemy to trigger damage effect.', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateStatusText();

    // 记录初始状态
    this.logEvent('Game started', { health: this.playerHealth });
  }

  update() {
    // 玩家移动控制
    if (!this.isInvincible || true) { // 即使无敌也可以移动
      this.player.setVelocity(0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-160);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(160);
      }
    }

    this.updateStatusText();
  }

  handleDamage(player, enemy) {
    // 如果正在无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.playerHealth -= 10;
    window.__signals__.damageCount++;
    window.__signals__.playerHealth = this.playerHealth;

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    // 计算击退距离（基于速度80）
    const knockbackDistance = this.knockbackSpeed * 1.5; // 击退距离
    const knockbackDuration = 300; // 击退持续时间（毫秒）

    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 记录击退事件
    const knockbackEvent = {
      timestamp: Date.now(),
      fromX: player.x,
      fromY: player.y,
      toX: targetX,
      toY: targetY,
      angle: angle,
      distance: knockbackDistance
    };
    window.__signals__.knockbackEvents.push(knockbackEvent);

    this.logEvent('Player damaged', {
      health: this.playerHealth,
      knockback: knockbackEvent
    });

    // 开始无敌状态
    this.isInvincible = true;
    window.__signals__.isInvincible = true;

    // 停止玩家当前速度
    player.setVelocity(0);

    // 击退效果（使用 Tween）
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: knockbackDuration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        player.setVelocity(0);
      }
    });

    // 白色闪烁效果（1秒内闪烁）
    this.startBlinkEffect(player);

    // 1秒后结束无敌状态
    this.time.delayedCall(1000, () => {
      this.isInvincible = false;
      window.__signals__.isInvincible = false;
      player.clearTint(); // 确保恢复原色
      
      this.logEvent('Invincibility ended', { health: this.playerHealth });
    });

    // 检查游戏结束
    if (this.playerHealth <= 0) {
      this.logEvent('Game over', { health: 0 });
      this.scene.pause();
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000'
      }).setOrigin(0.5);
    }
  }

  startBlinkEffect(sprite) {
    // 清除之前的闪烁定时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
    }

    let blinkCount = 0;
    const totalBlinks = 10; // 1秒内闪烁10次
    const blinkInterval = 100; // 每100ms切换一次

    // 创建闪烁定时器
    this.blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        blinkCount++;
        
        // 在蓝色和白色之间切换
        if (blinkCount % 2 === 0) {
          sprite.setTint(0xffffff); // 白色
        } else {
          sprite.clearTint(); // 恢复原色（蓝色）
        }

        // 闪烁完成后恢复原色
        if (blinkCount >= totalBlinks) {
          sprite.clearTint();
          this.blinkTimer.remove();
          this.blinkTimer = null;
        }
      },
      loop: true
    });
  }

  updateStatusText() {
    this.statusText.setText([
      `Health: ${this.playerHealth}`,
      `Damage Count: ${window.__signals__.damageCount}`,
      `Invincible: ${this.isInvincible ? 'YES' : 'NO'}`,
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    ]);
  }

  logEvent(eventName, data) {
    const logEntry = {
      timestamp: Date.now(),
      event: eventName,
      data: data
    };
    window.__signals__.logs.push(logEntry);
    console.log('[GAME LOG]', JSON.stringify(logEntry));
  }
}

// Phaser 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);