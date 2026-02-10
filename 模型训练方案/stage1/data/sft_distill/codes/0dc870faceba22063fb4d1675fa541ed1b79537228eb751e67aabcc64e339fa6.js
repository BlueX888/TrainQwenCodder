class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 20;
    this.maxHealth = 20;
    this.isInvincible = false;
    this.invincibleDuration = 1500; // 1.5秒
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    
    // 创建4个移动的敌人
    const enemyPositions = [
      { x: 100, y: 100, vx: 100, vy: 80 },
      { x: 700, y: 100, vx: -120, vy: 90 },
      { x: 100, y: 500, vx: 110, vy: -85 },
      { x: 700, y: 500, vx: -90, vy: -95 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(pos.vx, pos.vy);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1); // 碰到边界反弹
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

    // 创建UI容器
    this.createUI();

    // 添加说明文本
    this.add.text(400, 30, '使用方向键移动，避免碰到红色敌人', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 游戏结束标志
    this.gameOver = false;
  }

  createUI() {
    // 血量条背景（黑色）
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 1);
    this.healthBarBg.fillRect(50, 550, 204, 24);

    // 血量条边框（白色）
    this.healthBarBorder = this.add.graphics();
    this.healthBarBorder.lineStyle(2, 0xffffff, 1);
    this.healthBarBorder.strokeRect(50, 550, 204, 24);

    // 血量条（红色）
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(260, 562, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 无敌状态提示文本
    this.invincibleText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ff00ff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  updateHealthBar() {
    this.healthBar.clear();
    this.healthBar.fillStyle(0xff0000, 1);
    const healthWidth = (this.health / this.maxHealth) * 200;
    this.healthBar.fillRect(52, 552, healthWidth, 20);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible || this.gameOver) {
      return;
    }

    // 扣除1点生命值
    this.health = Math.max(0, this.health - 1);
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
    this.updateHealthBar();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleGameOver();
      return;
    }

    // 进入无敌状态
    this.enterInvincibleState();
  }

  enterInvincibleState() {
    this.isInvincible = true;

    // 保存原始颜色
    const originalTint = this.player.tint;

    // 将玩家变为紫色
    this.player.setTint(0xff00ff);

    // 显示无敌提示
    this.invincibleText.setText('无敌状态！').setVisible(true);

    // 创建闪烁效果（透明度变化）
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1
    });

    // 1.5秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.exitInvincibleState(originalTint);
    });
  }

  exitInvincibleState(originalTint) {
    this.isInvincible = false;

    // 停止闪烁
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 恢复玩家外观
    this.player.setAlpha(1);
    this.player.setTint(0x00ff00);

    // 隐藏无敌提示
    this.invincibleText.setVisible(false);
  }

  handleGameOver() {
    this.gameOver = true;

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 玩家变灰
    this.player.setTint(0x888888);
    this.player.setAlpha(0.5);

    // 显示游戏结束文本
    this.add.text(400, 300, '游戏结束！', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 360, '按 R 重新开始', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加重启功能
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.gameOver) {
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