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
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人（移动的障碍物）
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人在不同位置
    const enemy1 = this.enemies.create(200, 200, 'enemy');
    enemy1.setVelocity(100, 50);
    enemy1.setBounce(1, 1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(600, 300, 'enemy');
    enemy2.setVelocity(-80, 80);
    enemy2.setBounce(1, 1);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(400, 100, 'enemy');
    enemy3.setVelocity(60, -100);
    enemy3.setBounce(1, 1);
    enemy3.setCollideWorldBounds(true);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI - 血量显示
    this.createHealthBar();

    // 创建状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(400, 550, '使用方向键移动 | 碰撞扣1血 | 无敌时闪烁', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);
  }

  createHealthBar() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(16, 50, 204, 24);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(16, 50, 204, 24);

    // 血量条前景
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(118, 62, `${this.health}/${this.maxHealth}`, {
      fontSize: '16px',
      fill: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量显示不同颜色
    let color = 0x00ff00; // 绿色
    if (this.health <= 2) {
      color = 0xff0000; // 红色
    } else if (this.health <= 3) {
      color = 0xff9900; // 橙色
    }

    const healthPercentage = this.health / this.maxHealth;
    const barWidth = 200 * healthPercentage;

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(18, 52, barWidth, 20);

    // 更新血量文本
    this.healthText.setText(`${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不扣血
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.updateHealthBar();
    this.updateStatusText();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleGameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果 - 紫色调
    this.player.setTint(0xff00ff); // 紫色无敌效果

    // Alpha闪烁动画
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1, // 无限循环直到停止
      ease: 'Sine.easeInOut'
    });

    // 2秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  endInvincibility() {
    this.isInvincible = false;

    // 停止闪烁动画
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 恢复正常外观
    this.player.clearTint();
    this.player.setAlpha(1);

    this.updateStatusText();
  }

  handleGameOver() {
    // 停止所有敌人
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 显示游戏结束文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 370, '刷新页面重新开始', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 禁用输入
    this.input.keyboard.enabled = false;
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? '无敌中' : '正常';
    this.statusText.setText(
      `血量: ${this.health}/${this.maxHealth} | 状态: ${invincibleStatus}`
    );
  }

  update(time, delta) {
    // 如果游戏结束，不处理输入
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
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);