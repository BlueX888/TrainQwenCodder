// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  playerHealth: 3,
  hitCount: 0,
  knockbackEvents: [],
  playerPositions: [],
  isInvulnerable: false
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.isInvulnerable = false;
    this.playerHealth = 3;
    this.hitCount = 0;
    this.knockbackSpeed = 80; // 击退相关速度
    this.knockbackDistance = 150; // 基于速度计算的击退距离
    this.flashDuration = 1000; // 闪烁持续时间（毫秒）
  }

  preload() {
    // 使用 Graphics 创建纹理，不依赖外部资源
    this.createTextures();
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.originalTint = 0x0088ff;

    // 创建敌人（自动移动）
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocity(-100, 50);
    this.enemy.setBounce(1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onPlayerHit, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.healthText = this.add.text(16, 16, `Health: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.hitCountText = this.add.text(16, 50, `Hits: ${this.hitCount}`, {
      fontSize: '24px',
      fill: '#fff'
    });

    this.statusText = this.add.text(16, 84, 'Status: Normal', {
      fontSize: '24px',
      fill: '#fff'
    });

    // 定期记录玩家位置
    this.time.addEvent({
      delay: 100,
      callback: this.recordPlayerPosition,
      callbackScope: this,
      loop: true
    });

    console.log('[GAME_START]', JSON.stringify({
      playerPos: { x: this.player.x, y: this.player.y },
      enemyPos: { x: this.enemy.x, y: this.enemy.y },
      health: this.playerHealth
    }));
  }

  onPlayerHit(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvulnerable) {
      return;
    }

    // 减少生命值
    this.playerHealth--;
    this.hitCount++;
    window.__signals__.playerHealth = this.playerHealth;
    window.__signals__.hitCount = this.hitCount;

    // 计算击退方向
    const knockbackAngle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );

    const knockbackX = Math.cos(knockbackAngle) * this.knockbackDistance;
    const knockbackY = Math.sin(knockbackAngle) * this.knockbackDistance;

    const targetX = Phaser.Math.Clamp(
      player.x + knockbackX,
      20,
      this.scale.width - 20
    );
    const targetY = Phaser.Math.Clamp(
      player.y + knockbackY,
      20,
      this.scale.height - 20
    );

    // 记录击退事件
    const knockbackEvent = {
      timestamp: Date.now(),
      fromPos: { x: player.x, y: player.y },
      toPos: { x: targetX, y: targetY },
      angle: knockbackAngle,
      distance: this.knockbackDistance
    };
    window.__signals__.knockbackEvents.push(knockbackEvent);

    console.log('[PLAYER_HIT]', JSON.stringify({
      hitCount: this.hitCount,
      health: this.playerHealth,
      knockback: knockbackEvent
    }));

    // 设置无敌状态
    this.isInvulnerable = true;
    window.__signals__.isInvulnerable = true;
    this.statusText.setText('Status: Invulnerable');

    // 击退效果（Tween 动画）
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: (this.knockbackDistance / this.knockbackSpeed) * 1000, // 基于速度计算时间
      ease: 'Power2'
    });

    // 白色闪烁效果（1秒内多次闪烁）
    this.startFlashEffect(player);

    // 1秒后恢复正常状态
    this.time.delayedCall(this.flashDuration, () => {
      this.isInvulnerable = false;
      window.__signals__.isInvulnerable = false;
      this.statusText.setText('Status: Normal');
      player.setTint(player.originalTint);
      
      console.log('[INVULNERABLE_END]', JSON.stringify({
        playerPos: { x: player.x, y: player.y },
        health: this.playerHealth
      }));
    });

    // 检查游戏结束
    if (this.playerHealth <= 0) {
      this.gameOver();
    }

    this.updateUI();
  }

  startFlashEffect(player) {
    // 创建闪烁时间线（在1秒内闪烁5次）
    const flashCount = 5;
    const flashInterval = this.flashDuration / (flashCount * 2);

    let currentFlash = 0;
    const flashTimer = this.time.addEvent({
      delay: flashInterval,
      callback: () => {
        if (currentFlash % 2 === 0) {
          // 变白色
          player.setTint(0xffffff);
        } else {
          // 恢复原色
          player.setTint(player.originalTint);
        }
        currentFlash++;
      },
      repeat: flashCount * 2 - 1
    });
  }

  recordPlayerPosition() {
    if (this.player) {
      const posData = {
        timestamp: Date.now(),
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        invulnerable: this.isInvulnerable
      };
      window.__signals__.playerPositions.push(posData);
      
      // 只保留最近100条记录
      if (window.__signals__.playerPositions.length > 100) {
        window.__signals__.playerPositions.shift();
      }
    }
  }

  updateUI() {
    this.healthText.setText(`Health: ${this.playerHealth}`);
    this.hitCountText.setText(`Hits: ${this.hitCount}`);
  }

  gameOver() {
    this.statusText.setText('Status: GAME OVER');
    this.physics.pause();
    
    console.log('[GAME_OVER]', JSON.stringify({
      totalHits: this.hitCount,
      finalHealth: this.playerHealth,
      totalKnockbacks: window.__signals__.knockbackEvents.length
    }));

    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    }).setOrigin(0.5);
  }

  update() {
    if (this.playerHealth <= 0) {
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
const game = new Phaser.Game(config);