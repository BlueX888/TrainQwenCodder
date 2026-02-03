class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 3000; // 3秒
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
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
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（多个敌人增加碰撞机会）
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      enemy.setVelocity(
        Phaser.Math.Between(-150, 150),
        Phaser.Math.Between(-150, 150)
      );
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

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 20, 244, 24);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(20, 50, `HP: ${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });

    // 无敌状态文本
    this.invincibleText = this.add.text(20, 80, '', {
      fontSize: '18px',
      color: '#00ffff',
      fontFamily: 'Arial'
    });

    // 游戏说明
    this.add.text(400, 550, '使用方向键移动 | 碰撞红色方块扣1血 | 无敌时闪烁3秒', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);
  }

  update(time, delta) {
    if (this.currentHealth <= 0) {
      return; // 游戏结束，停止更新
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
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.currentHealth -= 1;
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.currentHealth}/${this.maxHealth}`);

    // 检查是否死亡
    if (this.currentHealth <= 0) {
      this.handleDeath();
      return;
    }

    // 进入无敌状态
    this.isInvincible = true;
    this.invincibleText.setText('无敌中...');

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 200,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 设置无敌计时器
    this.time.delayedCall(this.invincibleDuration, () => {
      this.isInvincible = false;
      this.invincibleText.setText('');
      
      // 停止闪烁，恢复完全不透明
      if (this.blinkTween) {
        this.blinkTween.stop();
        this.player.setAlpha(1);
      }
    });

    // 击退效果
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    this.player.setVelocity(
      Math.cos(angle) * 300,
      Math.sin(angle) * 300
    );
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量比例选择颜色
    let color;
    const healthPercent = this.currentHealth / this.maxHealth;
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    } else {
      color = 0xff0000; // 红色
    }

    this.healthBar.fillStyle(color, 1);
    const barWidth = (this.currentHealth / this.maxHealth) * 240;
    this.healthBar.fillRect(22, 22, barWidth, 20);
  }

  handleDeath() {
    // 停止物理引擎
    this.physics.pause();
    
    // 停止闪烁
    if (this.blinkTween) {
      this.blinkTween.stop();
    }
    
    // 玩家变灰
    this.player.setTint(0x666666);
    this.player.setAlpha(1);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    // 更新状态文本
    this.invincibleText.setText('');
    this.healthText.setText('HP: 0/12');
    
    // 添加重启提示
    this.add.text(400, 370, '刷新页面重新开始', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
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