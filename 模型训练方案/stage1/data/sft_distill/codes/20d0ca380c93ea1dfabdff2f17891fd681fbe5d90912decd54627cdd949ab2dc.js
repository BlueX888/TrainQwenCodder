class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 15;
    this.maxHealth = 15;
    this.isInvincible = false;
    this.invincibilityDuration = 1500; // 1.5秒
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

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人在不同位置
    const enemyPositions = [
      { x: 200, y: 200 },
      { x: 600, y: 200 },
      { x: 400, y: 100 },
      { x: 300, y: 300 },
      { x: 500, y: 350 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
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

    // 创建血量条UI
    this.createHealthBar();

    // 添加状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();
  }

  createHealthBar() {
    const barWidth = 300;
    const barHeight = 30;
    const barX = 250;
    const barY = 550;

    // 血量条背景（深灰色）
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x333333, 1);
    this.healthBarBg.fillRect(barX, barY, barWidth, barHeight);

    // 血量条边框
    this.healthBarBorder = this.add.graphics();
    this.healthBarBorder.lineStyle(3, 0xffffff, 1);
    this.healthBarBorder.strokeRect(barX, barY, barWidth, barHeight);

    // 血量条（青色）
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 血量文本
    this.healthText = this.add.text(barX + barWidth / 2, barY + barHeight / 2, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });
    this.healthText.setOrigin(0.5, 0.5);
    this.updateHealthText();
  }

  updateHealthBar() {
    const barWidth = 300;
    const barHeight = 30;
    const barX = 250;
    const barY = 550;

    this.healthBar.clear();
    
    // 根据生命值比例计算当前血量条宽度
    const healthPercent = this.health / this.maxHealth;
    const currentWidth = barWidth * healthPercent;

    // 根据血量百分比选择颜色
    let color = 0x00ffff; // 青色（无敌帧颜色）
    if (!this.isInvincible) {
      if (healthPercent > 0.6) {
        color = 0x00ff00; // 绿色
      } else if (healthPercent > 0.3) {
        color = 0xffff00; // 黄色
      } else {
        color = 0xff0000; // 红色
      }
    }

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(barX, barY, currentWidth, barHeight);
  }

  updateHealthText() {
    this.healthText.setText(`${this.health} / ${this.maxHealth}`);
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? '无敌中' : '正常';
    this.statusText.setText(
      `生命值: ${this.health}/${this.maxHealth}\n` +
      `状态: ${invincibleStatus}\n` +
      `使用方向键移动`
    );
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除1点生命值
    this.health = Math.max(0, this.health - 1);
    
    // 更新UI
    this.updateHealthBar();
    this.updateHealthText();
    this.updateStatusText();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handlePlayerDeath();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    this.updateStatusText();

    // 创建闪烁效果（青色提示）
    this.player.setTint(0x00ffff); // 设置青色色调
    
    // 使用 Tween 实现闪烁效果
    this.invincibilityTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 4, // 重复4次，共1.5秒左右
      onComplete: () => {
        // 闪烁结束，恢复正常
        this.player.alpha = 1;
        this.player.clearTint();
        this.isInvincible = false;
        this.updateStatusText();
        this.updateHealthBar();
      }
    });

    // 同时更新血量条为青色
    this.updateHealthBar();

    // 设置定时器确保无敌时间准确为1.5秒
    this.time.delayedCall(this.invincibilityDuration, () => {
      if (this.invincibilityTween && this.invincibilityTween.isPlaying()) {
        this.invincibilityTween.stop();
      }
      this.player.alpha = 1;
      this.player.clearTint();
      this.isInvincible = false;
      this.updateStatusText();
      this.updateHealthBar();
    });
  }

  handlePlayerDeath() {
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.setTint(0x888888);
    
    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4
    });
    gameOverText.setOrigin(0.5, 0.5);

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 禁用输入
    this.cursors = null;

    // 添加重启提示
    const restartText = this.add.text(400, 380, '点击屏幕重启', {
      fontSize: '24px',
      fill: '#ffffff'
    });
    restartText.setOrigin(0.5, 0.5);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (!this.cursors || this.health <= 0) {
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