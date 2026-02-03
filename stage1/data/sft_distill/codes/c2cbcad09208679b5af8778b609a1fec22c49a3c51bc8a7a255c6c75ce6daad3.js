class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 10;
    this.maxHealth = 10;
    this.isInvincible = false;
    this.invincibleDuration = 2500; // 2.5秒
    this.collisionCount = 0;
    
    // 信号输出
    window.__signals__ = {
      health: this.health,
      maxHealth: this.maxHealth,
      collisions: [],
      invinciblePeriods: []
    };
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 随机速度
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(-150, 150);
      enemy.setVelocity(velocityX, velocityY);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI
    this.createUI();

    // 添加说明文字
    this.add.text(10, 10, '使用方向键移动\n碰撞敌人扣1血\n无敌时间2.5秒（闪烁）', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
  }

  createUI() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(250, 550, 300, 30);

    // 血量条
    this.healthBar = this.add.graphics();
    
    // 血量文字
    this.healthText = this.add.text(400, 565, `${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5);

    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量显示不同颜色
    let color = 0x00ff00; // 绿色
    if (this.health <= 3) {
      color = 0xff0000; // 红色
    } else if (this.health <= 6) {
      color = 0xffaa00; // 橙色
    }

    const barWidth = (this.health / this.maxHealth) * 300;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(250, 550, barWidth, 30);

    this.healthText.setText(`${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.collisionCount++;

    // 记录碰撞信号
    const collisionSignal = {
      timestamp: this.time.now,
      health: this.health,
      collisionNumber: this.collisionCount,
      playerPos: { x: player.x, y: player.y },
      enemyPos: { x: enemy.x, y: enemy.y }
    };
    window.__signals__.collisions.push(collisionSignal);
    window.__signals__.health = this.health;

    console.log(`[COLLISION] #${this.collisionCount} - Health: ${this.health}/${this.maxHealth}`);

    // 更新血量条
    this.updateHealthBar();

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌状态
    this.startInvincible();
  }

  startInvincible() {
    this.isInvincible = true;

    const invincibleSignal = {
      startTime: this.time.now,
      duration: this.invincibleDuration,
      endTime: this.time.now + this.invincibleDuration
    };
    window.__signals__.invinciblePeriods.push(invincibleSignal);

    console.log(`[INVINCIBLE] Started - Duration: ${this.invincibleDuration}ms`);

    // 创建闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(this.invincibleDuration / 300) - 1,
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvincible = false;
        console.log('[INVINCIBLE] Ended');
      }
    });

    // 备用计时器（确保无敌状态结束）
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.player.alpha = 1;
    });
  }

  gameOver() {
    console.log('[GAME OVER] Health depleted');
    window.__signals__.gameOver = true;
    window.__signals__.finalHealth = this.health;

    // 停止物理
    this.physics.pause();

    // 显示游戏结束文字
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    const statsText = this.add.text(400, 380, 
      `总碰撞次数: ${this.collisionCount}\n点击重新开始`, {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center'
    });
    statsText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.health <= 0) {
      return;
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

    // 更新无敌状态显示（可选：添加视觉提示）
    if (this.isInvincible && !this.invincibleIndicator) {
      this.invincibleIndicator = this.add.text(400, 520, '无敌状态', {
        fontSize: '18px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      this.invincibleIndicator.setOrigin(0.5);
    } else if (!this.isInvincible && this.invincibleIndicator) {
      this.invincibleIndicator.destroy();
      this.invincibleIndicator = null;
    }
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

const game = new Phaser.Game(config);