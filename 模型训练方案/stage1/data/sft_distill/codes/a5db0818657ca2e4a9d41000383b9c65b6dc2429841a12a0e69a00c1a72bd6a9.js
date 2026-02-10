class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.maxHealth = 12;
    this.currentHealth = 12;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 35, 35);
    enemyGraphics.generateTexture('enemy', 35, 35);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 添加多个敌人
    for (let i = 0; i < 5; i++) {
      const enemy = this.enemies.create(
        100 + i * 150,
        100 + (i % 2) * 200,
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

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

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(20, 20, 240, 30);
    this.healthBarBg.lineStyle(2, 0xffffff, 1);
    this.healthBarBg.strokeRect(20, 20, 240, 30);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(130, 25, `${this.currentHealth}/${this.maxHealth}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5, 0);

    // 创建状态文本
    this.statusText = this.add.text(400, 570, '', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    this.statusText.setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
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

    // 更新状态文本
    if (this.isInvincible) {
      this.statusText.setText('无敌状态中...');
    } else {
      this.statusText.setText('使用方向键移动，避开红色敌人！');
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不受伤害
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.currentHealth -= 1;
    this.updateHealthBar();

    console.log(`受到伤害！当前血量: ${this.currentHealth}/${this.maxHealth}`);

    // 检查是否死亡
    if (this.currentHealth <= 0) {
      this.handleDeath();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，共0.5秒
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvincible = false;
        console.log('无敌状态结束');
      }
    });

    // 橙色闪光效果
    this.tweens.add({
      targets: this.player,
      tint: 0xffa500, // 橙色
      duration: 100,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.player.clearTint();
      }
    });
  }

  updateHealthBar() {
    // 清除旧的血量条
    this.healthBar.clear();

    // 计算血量百分比
    const healthPercent = this.currentHealth / this.maxHealth;
    const barWidth = 236; // 240 - 4 (边距)
    const currentBarWidth = barWidth * healthPercent;

    // 根据血量百分比设置颜色
    let color;
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffaa00; // 橙色
    } else {
      color = 0xff0000; // 红色
    }

    // 绘制血量条
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(22, 22, currentBarWidth, 26);

    // 更新血量文本
    this.healthText.setText(`${this.currentHealth}/${this.maxHealth}`);
  }

  handleDeath() {
    console.log('玩家死亡！');
    
    // 停止玩家移动
    this.player.setVelocity(0);
    this.player.setTint(0x666666);

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 添加重启提示
    const restartText = this.add.text(400, 370, '点击任意位置重启', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
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