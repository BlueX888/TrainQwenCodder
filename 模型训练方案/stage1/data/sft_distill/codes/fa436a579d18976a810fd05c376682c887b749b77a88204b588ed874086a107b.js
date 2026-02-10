class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 20;
    this.maxHealth = 20;
    this.isInvincible = false;
  }

  preload() {
    // 创建纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理（绿色）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 敌人纹理（红色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人，随机位置和速度
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(-150, 150);
      enemy.setVelocity(velocityX, velocityY);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量UI
    this.createHealthUI();

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态文本
    this.statusText = this.add.text(10, 60, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    this.updateStatusText();
  }

  createHealthUI() {
    // 血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(10, 10, 204, 24);

    // 血量条
    this.healthBar = this.add.graphics();
    
    // 血量文本
    this.healthText = this.add.text(220, 10, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.updateHealthBar();
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量百分比选择颜色
    const healthPercent = this.health / this.maxHealth;
    let color = 0x00ff00; // 绿色
    if (healthPercent < 0.3) {
      color = 0xff0000; // 红色
    } else if (healthPercent < 0.6) {
      color = 0xffff00; // 黄色
    }
    
    this.healthBar.fillStyle(color, 1);
    const barWidth = (this.health / this.maxHealth) * 200;
    this.healthBar.fillRect(12, 12, barWidth, 20);
    
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health = Math.max(0, this.health - 1);
    this.updateHealthBar();
    this.updateStatusText();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleDeath();
      return;
    }

    // 触发无敌帧
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 闪烁效果 - 使用紫色调制
    this.player.setTint(0xff00ff); // 紫色
    
    // 创建闪烁动画
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 9, // 重复9次，加上初始一次共10次闪烁，总计1.5秒
      onComplete: () => {
        this.endInvincibility();
      }
    });
  }

  endInvincibility() {
    this.isInvincible = false;
    this.player.setAlpha(1);
    this.player.clearTint();
    this.updateStatusText();
  }

  handleDeath() {
    // 停止所有动画
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 玩家变灰
    this.player.setTint(0x666666);
    this.player.setAlpha(0.5);

    // 停止所有敌人移动
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 禁用输入
    this.cursors = null;
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? 'INVINCIBLE' : 'NORMAL';
    this.statusText.setText(`Status: ${invincibleStatus}`);
    
    if (this.isInvincible) {
      this.statusText.setColor('#ff00ff'); // 紫色
    } else {
      this.statusText.setColor('#ffffff'); // 白色
    }
  }

  update(time, delta) {
    if (!this.cursors || this.health <= 0) {
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
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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