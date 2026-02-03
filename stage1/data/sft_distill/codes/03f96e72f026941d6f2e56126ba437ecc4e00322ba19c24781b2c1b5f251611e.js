// 全局信号对象
window.__signals__ = {
  health: 10,
  isInvincible: false,
  collisionCount: 0,
  gameOver: false,
  events: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 10;
    this.maxHealth = 10;
    this.isInvincible = false;
    this.invincibilityDuration = 2500; // 2.5秒
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
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

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人，随机位置和速度
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      enemy.setVelocity(
        Phaser.Math.Between(-150, 150),
        Phaser.Math.Between(-150, 150)
      );
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x666666, 1);
    this.healthBarBg.fillRect(20, 20, 204, 24);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(232, 22, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(400, 100, '', {
      fontSize: '24px',
      color: '#ffff00',
      fontStyle: 'bold'
    });
    this.invincibleText.setOrigin(0.5);

    // 创建游戏结束文本
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 记录初始状态
    this.logEvent('game_start', { health: this.health });
  }

  update(time, delta) {
    if (this.health <= 0) {
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

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    window.__signals__.health = this.health;
    window.__signals__.collisionCount += 1;

    // 更新血量显示
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

    // 记录碰撞事件
    this.logEvent('collision', {
      health: this.health,
      collisionCount: window.__signals__.collisionCount,
      playerPos: { x: Math.round(player.x), y: Math.round(player.y) },
      enemyPos: { x: Math.round(enemy.x), y: Math.round(enemy.y) }
    });

    // 检查游戏是否结束
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;
    window.__signals__.isInvincible = true;

    // 显示无敌提示
    this.invincibleText.setText('INVINCIBLE!');

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1
    });

    // 记录无敌开始
    this.logEvent('invincibility_start', {
      duration: this.invincibilityDuration,
      health: this.health
    });

    // 设置定时器，2.5秒后解除无敌
    this.time.delayedCall(this.invincibilityDuration, () => {
      this.deactivateInvincibility();
    });
  }

  deactivateInvincibility() {
    this.isInvincible = false;
    window.__signals__.isInvincible = false;

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 恢复完全不透明
    this.player.setAlpha(1);

    // 清除无敌提示
    this.invincibleText.setText('');

    // 记录无敌结束
    this.logEvent('invincibility_end', { health: this.health });
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据生命值百分比选择颜色
    let color;
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    } else {
      color = 0xff0000; // 红色
    }

    this.healthBar.fillStyle(color, 1);
    const barWidth = (this.health / this.maxHealth) * 200;
    this.healthBar.fillRect(22, 22, barWidth, 20);
  }

  gameOver() {
    window.__signals__.gameOver = true;

    // 停止所有敌人移动
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0);
    });

    // 停止玩家移动
    this.player.setVelocity(0);

    // 显示游戏结束文本
    this.gameOverText.setText('GAME OVER');
    this.gameOverText.setColor('#ff0000');

    // 如果有无敌闪烁，停止它
    if (this.blinkTween) {
      this.blinkTween.stop();
    }
    this.player.setAlpha(1);

    // 记录游戏结束
    this.logEvent('game_over', {
      finalHealth: this.health,
      totalCollisions: window.__signals__.collisionCount
    });

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
      // 重置信号
      window.__signals__ = {
        health: 10,
        isInvincible: false,
        collisionCount: 0,
        gameOver: false,
        events: []
      };
    });
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    window.__signals__.events.push(event);
    console.log(`[EVENT] ${eventType}:`, JSON.stringify(data));
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

// 启动游戏
new Phaser.Game(config);