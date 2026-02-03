class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.maxHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 1500; // 1.5秒
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人（确定性位置）
    const enemyPositions = [
      { x: 100, y: 100, vx: 100, vy: 50 },
      { x: 700, y: 100, vx: -80, vy: 60 },
      { x: 100, y: 500, vx: 120, vy: -40 },
      { x: 700, y: 500, vx: -90, vy: -70 },
      { x: 400, y: 100, vx: 0, vy: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(pos.vx, pos.vy);
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

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量条UI
    this.createHealthBar();

    // 添加说明文字
    this.add.text(10, 10, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.add.text(10, 30, 'Avoid Red Enemies!', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 状态文本
    this.statusText = this.add.text(10, 560, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });
  }

  createHealthBar() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(250, 560, 300, 30);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(250, 560, 300, 30);

    // 血量条前景
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文字
    this.healthText = this.add.text(400, 575, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量比例选择颜色
    let color = 0x00ff00; // 绿色
    const healthPercent = this.health / this.maxHealth;
    
    if (healthPercent <= 0.25) {
      color = 0xff0000; // 红色
    } else if (healthPercent <= 0.5) {
      color = 0xff8800; // 橙色
    } else if (healthPercent <= 0.75) {
      color = 0xffff00; // 黄色
    }

    const barWidth = (this.health / this.maxHealth) * 296;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(252, 562, barWidth, 26);

    // 更新文字
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.updateHealthBar();

    // 显示受伤提示
    this.statusText.setText('Hit! -1 HP | Invincible!');
    this.statusText.setColor('#ff0000');

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 设置无敌时间结束
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      
      // 停止闪烁
      if (this.blinkTween) {
        this.blinkTween.stop();
      }
      
      // 恢复完全不透明
      this.player.setAlpha(1);

      // 清除状态文字
      this.statusText.setText('');
    });
  }

  gameOver() {
    // 停止物理引擎
    this.physics.pause();

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 显示游戏结束
    this.player.setTint(0x666666);
    this.player.setAlpha(1);

    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const restartText = this.add.text(400, 370, 'Click to Restart', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
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

    // 更新状态文本（显示无敌状态）
    if (this.isInvincible && this.health > 0) {
      const remainingTime = Math.ceil(
        (this.invincibleDuration - 
         (time - (this.lastHitTime || time))) / 1000
      );
      if (!this.lastHitTime) {
        this.lastHitTime = time;
      }
    } else {
      this.lastHitTime = null;
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

new Phaser.Game(config);